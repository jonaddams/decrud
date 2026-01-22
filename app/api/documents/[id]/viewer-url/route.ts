import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getEffectiveDocumentFilter, requireAuth } from '@/lib/auth';
import { documentEngineService } from '@/lib/document-engine';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents/[id]/viewer-url
 * Generate a Document Engine viewer URL with JWT
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const filter = getEffectiveDocumentFilter(session.user);

    // Get permission level from query params (default to read-only)
    const { searchParams } = new URL(request.url);
    const permissionLevel = searchParams.get('permissionLevel') || 'read-only';

    // Check if document exists and user has access
    const document = await prisma.document.findFirst({
      where: {
        id,
        ...filter,
      },
      select: {
        id: true,
        documentEngineId: true,
        title: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate JWT based on permission level
    const basePermissions = ['read-document', 'download', 'cover-image'];
    const permissions =
      permissionLevel === 'edit' ? [...basePermissions, 'write'] : basePermissions;
    const jwtToken = await documentEngineService.generateViewerJWT(
      document.documentEngineId,
      permissions,
      session.user.id,
      2 // 2 hour expiry
    );

    // Get URLs
    const viewerUrl = documentEngineService.getViewerUrl(document.documentEngineId, jwtToken);
    const thumbnailUrl = documentEngineService.getThumbnailUrl(document.documentEngineId, jwtToken);
    const downloadUrl = documentEngineService.getDownloadUrl(document.documentEngineId, jwtToken);

    return NextResponse.json({
      viewerUrl,
      thumbnailUrl,
      downloadUrl,
      jwt: jwtToken,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    });
  } catch (error) {
    console.error(`GET /api/documents/[id]/viewer-url error:`, error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('JWT')) {
      return NextResponse.json(
        { error: 'Failed to generate viewer access. Please check Document Engine configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to generate viewer URL' }, { status: 500 });
  }
}
