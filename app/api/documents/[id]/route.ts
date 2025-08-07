import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getEffectiveDocumentFilter, requireAuth } from '@/lib/auth';
import { documentEngineService } from '@/lib/document-engine';

const prisma = new PrismaClient();

/**
 * GET /api/documents/[id]
 * Get a specific document's metadata
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const filter = getEffectiveDocumentFilter(session.user);

    const document = await prisma.document.findFirst({
      where: {
        id,
        ...filter,
      },
      select: {
        id: true,
        documentEngineId: true,
        title: true,
        filename: true,
        fileType: true,
        fileSize: true,
        author: true,
        createdAt: true,
        updatedAt: true,
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

    // Convert BigInt to string for JSON serialization
    const serializedDocument = {
      ...document,
      fileSize: document.fileSize?.toString(),
    };

    return NextResponse.json({ document: serializedDocument });
  } catch (error) {
    console.error(`GET /api/documents/[id] error:`, error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

/**
 * PUT /api/documents/[id]
 * Update a document's metadata
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const filter = getEffectiveDocumentFilter(session.user);

    const { title, author } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if document exists and user has access
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        ...filter,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        title,
        author: author || existingDocument.author,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        documentEngineId: true,
        title: true,
        filename: true,
        fileType: true,
        fileSize: true,
        author: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedDocument = {
      ...document,
      fileSize: document.fileSize?.toString(),
    };

    return NextResponse.json({ document: serializedDocument });
  } catch (error) {
    console.error(`PUT /api/documents/[id] error:`, error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const filter = getEffectiveDocumentFilter(session.user);

    // Check if document exists and user has access
    const document = await prisma.document.findFirst({
      where: {
        id,
        ...filter,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from Document Engine (with retry logic, but don't fail if it fails)
    try {
      await documentEngineService.withRetry(() =>
        documentEngineService.deleteDocument(document.documentEngineId)
      );
    } catch (error) {
      console.warn('Failed to delete document from Document Engine:', error);
      // Continue with database deletion even if Document Engine deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/documents/[id] error:`, error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
