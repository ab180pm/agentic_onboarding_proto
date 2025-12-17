import React from 'react';
import { ExternalLink } from 'lucide-react';

interface GNBProps {
  currentPage?: 'onboarding' | 'dashboard';
}

export function GNB({ currentPage = 'onboarding' }: GNBProps) {
  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        {/* Airbridge Logo */}
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#3B82F6" />
            <path
              d="M16 8L24 24H8L16 8Z"
              fill="white"
              fillOpacity="0.9"
            />
            <circle cx="16" cy="18" r="3" fill="#3B82F6" />
          </svg>
          <span className="font-semibold text-gray-900 text-lg">Airbridge</span>
        </div>

        {/* Navigation Menu */}
        <div className="flex items-center gap-1">
          <a
            href="/setup"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'onboarding'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Onboarding Manager
          </a>
          <a
            href="https://dashboard.airbridge.io"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentPage === 'dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Dashboard
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Right: User Profile (optional) */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">U</span>
        </div>
      </div>
    </nav>
  );
}
