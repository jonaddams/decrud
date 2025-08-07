import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { requireAuth, getEffectiveDocumentFilter } from '@/lib/auth';
import { DocumentViewer } from '@/components/document-viewer';

const prisma = new PrismaClient();

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

    const formatFileSize = (bytes: bigint | null) => {
      if (!bytes || bytes === BigInt(0)) return '0 Bytes';
      const bytesNumber = Number(bytes);
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytesNumber) / Math.log(k));
      return `${Math.round((bytesNumber / k ** i) * 100) / 100} ${sizes[i]}`;
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date));
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-500"
                  aria-label="Back to dashboard"
                >
                  <svg
                    className="h-6 w-6"
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
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {session.user.name || session.user.email}
                </span>
                <Link href="/api/auth/signout" className="text-sm text-blue-600 hover:text-blue-500">
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Document metadata */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{document.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">File Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatFileSize(document.fileSize)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">File Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{document.fileType}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Uploaded by</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {document.owner.name || document.owner.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(document.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(document.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Document viewer */}
            <DocumentViewer documentId={document.id} className="min-h-[700px]" />
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/auth/signin');
  }
}