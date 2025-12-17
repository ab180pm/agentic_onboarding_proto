import React, { ReactNode } from 'react';
import { GNB } from './GNB';

interface LayoutProps {
  children: ReactNode;
  currentPage?: 'onboarding' | 'dashboard';
}

export function Layout({ children, currentPage = 'onboarding' }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <GNB currentPage={currentPage} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
