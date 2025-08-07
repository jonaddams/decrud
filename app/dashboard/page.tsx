import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DocumentList } from '@/components/document-list';
import { RoleSwitcher } from '@/components/role-switcher';
import { requireAuth } from '@/lib/auth';

export default async function Dashboard() {
  try {
    const session = await requireAuth();

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
              </div>
              <div className="flex items-center space-x-4">
                <RoleSwitcher />
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {session.user.name || session.user.email}
                  </span>
                  <Link
                    href="/api/auth/signout"
                    className="text-sm text-blue-600 hover:text-blue-500"
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
          <div className="px-4 py-6 sm:px-0">
            {/* Action bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
              <Link
                href="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Document
              </Link>
            </div>

            {/* Document list */}
            <DocumentList />
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/auth/signin');
  }
}
