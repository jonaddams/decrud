'use client';

import Link from 'next/link';
import { RoleSwitcher } from '@/components/role-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import type { SessionUser } from '@/lib/auth';

type DashboardHeaderProps = {
  user: SessionUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="bg-background shadow border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">Document Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <RoleSwitcher />
            <ThemeToggle />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted">
                {user.name || user.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}