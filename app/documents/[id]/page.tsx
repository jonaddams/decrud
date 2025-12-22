import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DocumentMetadata } from '@/components/document-metadata';
import { DocumentViewer } from '@/components/document-viewer';
import { ThemeToggle } from '@/components/theme-toggle';
import { getEffectiveDocumentFilter, requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = {
  id: string;
};

export default async function DocumentView({ params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get the document with owner info
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
      notFound();
    }

    // Check if user can access this document based on role and impersonation
    const filter = getEffectiveDocumentFilter(session.user);
    const canAccess = await prisma.document.findFirst({
      where: {
        id,
        ...filter,
      },
    });

    if (!canAccess) {
      notFound();
    }

    // Check if current user is the owner
    const isOwner = document.owner.id === session.user.id;

    return (
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-background shadow border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/dashboard"
                  className="text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  aria-label="Back to dashboard"
                >
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <title>Back arrow</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </Link>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <ThemeToggle />
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm text-muted truncate max-w-20 sm:max-w-none">
                    {session.user.name || session.user.email}
                  </span>
                  <Link
                    href="/api/auth/signout"
                    className="text-xs sm:text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  >
                    Sign out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Document metadata with sign button */}
            <DocumentMetadata document={document} isOwner={isOwner} />

            {/* Document viewer */}
            <DocumentViewer documentId={document.id} className="h-[calc(100vh-240px)]" />
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/auth/signin');
  }
}
