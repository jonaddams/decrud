import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { documentEngineService } from '@/lib/document-engine';
import { signDocument } from '@/lib/dws-api';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * POST /api/documents/:id/sign
 * Signs a document using DWS Processor API
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    // Get the document and verify ownership
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user is the owner
    if (document.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the document owner can sign documents' },
        { status: 403 }
      );
    }

    // Get signature parameters from request body
    const body = (await request.json()) as {
      signerName: string;
      reason: string;
      signatureOptions: {
        signatureType: 'visible' | 'invisible';
        position: {
          pageIndex: number;
          x: number;
          y: number;
          width: number;
          height: number;
        };
        flatten?: boolean;
        showWatermark?: boolean;
        showSignDate?: boolean;
        showDateTimezone?: boolean;
        useCustomImage?: boolean;
        appearanceMode?: 'signatureOnly' | 'descriptionOnly' | 'signatureAndDescription';
      };
      replaceOriginal?: boolean;
    };

    // Download the document from Document Engine
    // Generate JWT for document access
    const jwt = await documentEngineService.generateViewerJWT(document.documentEngineId, [
      'read-document',
      'download',
    ]);

    // Use the /documents/{id}/pdf endpoint with JWT to get the PDF binary
    const documentEngineUrl = `${process.env.DOCUMENT_ENGINE_BASE_URL}/documents/${document.documentEngineId}/pdf?jwt=${jwt}`;
    const documentResponse = await fetch(documentEngineUrl);

    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.error('Document Engine download error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to download document from Document Engine',
          details: errorText,
        },
        { status: 500 }
      );
    }

    const documentBuffer = Buffer.from(await documentResponse.arrayBuffer());

    // Sign the document using DWS
    const signedBuffer = await signDocument({
      documentBuffer,
      signerName: body.signerName,
      reason: body.reason,
      signatureOptions: body.signatureOptions,
    });

    // Upload the signed document back to Document Engine
    const uploadFormData = new FormData();
    uploadFormData.append(
      'file',
      new Blob([new Uint8Array(signedBuffer)], { type: 'application/pdf' }),
      document.filename
    );

    // If replacing, use the overwrite parameter with the existing document ID
    if (body.replaceOriginal) {
      uploadFormData.append('document_id', document.documentEngineId);
      uploadFormData.append('overwrite_existing_document', 'true');
    }

    const uploadResponse = await fetch(`${process.env.DOCUMENT_ENGINE_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Token token=${process.env.DOCUMENT_ENGINE_API_KEY}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to upload signed document to Document Engine' },
        { status: 500 }
      );
    }

    let signedDocumentId: string;

    if (body.replaceOriginal) {
      // Update existing database entry with new file size
      await prisma.document.update({
        where: { id },
        data: {
          fileSize: BigInt(signedBuffer.length),
        },
      });
      signedDocumentId = id;
    } else {
      // Create a new document entry in the database for the signed document
      const uploadData = (await uploadResponse.json()) as { data: { document_id: string } };
      const signedDocumentEngineId = uploadData.data.document_id;

      const signedDocument = await prisma.document.create({
        data: {
          title: `${document.title} (Signed)`,
          filename: document.filename,
          fileType: document.fileType,
          fileSize: BigInt(signedBuffer.length),
          documentEngineId: signedDocumentEngineId,
          ownerId: session.user.id,
        },
      });
      signedDocumentId = signedDocument.id;
    }

    return NextResponse.json({
      success: true,
      documentId: signedDocumentId,
      message: 'Document signed successfully',
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      {
        error: 'Failed to sign document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
