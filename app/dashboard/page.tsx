import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  try {
    const session = await requireAuth();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500">
              Role: {session.user.role} | Mode: {session.user.currentImpersonationMode}
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">
              Dashboard content will be implemented in the next phase.
            </p>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/auth/signin');
  }
}