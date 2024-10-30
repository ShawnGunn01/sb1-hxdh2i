import React from 'react';
import { Loader } from 'lucide-react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-skeleton">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Logo placeholder */}
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
              {/* Navigation placeholder */}
              <div className="hidden md:flex ml-10 space-x-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            {/* User menu placeholder */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="lg:w-64 animate-pulse">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 space-y-8 animate-pulse">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="bg-white mt-12 border-t animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 w-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardSkeleton;