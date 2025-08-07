import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { documentEngineService } from '@/lib/document-engine';

/**
 * GET /api/document-engine/health
 * Check if Document Engine is available
 */
export async function GET() {
  try {
    await requireAuth();

    const isHealthy = await documentEngineService.healthCheck();

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Document Engine',
    });
  } catch (error) {
    console.error('Document Engine health check error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Document Engine',
      error: 'Health check failed',
    });
  }
}
