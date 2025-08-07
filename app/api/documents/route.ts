import { PrismaClient } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getEffectiveDocumentFilter, requireAuth } from '@/lib/auth';
import { documentEngineService } from '@/lib/document-engine';

const prisma = new PrismaClient();

/**
 * GET /api/documents
 * List all documents for the current user (with role-based filtering)
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const filter = getEffectiveDocumentFilter(session.user);

    const documents = await prisma.document.findMany({
      where: filter,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('GET /api/documents error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Upload to Document Engine with retry logic
    const documentEngineResult = await documentEngineService.withRetry(() =>
      documentEngineService.uploadDocument(file)
    );

    // Store metadata in database
    const document = await prisma.document.create({
      data: {
        documentEngineId: documentEngineResult.documentId,
        title,
        filename: file.name,
        fileType: file.type,
        fileSize: BigInt(file.size),
        author: author || session.user.name || session.user.email || 'Unknown',
        ownerId: session.user.id,
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

    return NextResponse.json({ document: serializedDocument }, { status: 201 });
  } catch (error) {
    console.error('POST /api/documents error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Document Engine')) {
      return NextResponse.json(
        { error: 'Document upload failed. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
