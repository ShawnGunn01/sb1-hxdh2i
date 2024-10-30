import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardSkeleton from '../../components/DashboardSkeleton';

describe('DashboardSkeleton', () => {
  test('renders skeleton loader with correct structure', () => {
    render(<DashboardSkeleton />);
    
    const skeleton = screen.getByTestId('dashboard-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.querySelector('header')).toBeInTheDocument();
    expect(skeleton.querySelector('main')).toBeInTheDocument();
    expect(skeleton.querySelector('footer')).toBeInTheDocument();
  });

  test('renders navigation placeholders', () => {
    render(<DashboardSkeleton />);
    
    const navItems = screen.getAllByRole('generic').filter(
      element => element.className.includes('h-4 w-20 bg-gray-200 rounded')
    );
    expect(navItems).toHaveLength(4);
  });

  test('renders sidebar menu items', () => {
    render(<DashboardSkeleton />);
    
    const sidebarItems = screen.getAllByRole('generic').filter(
      element => element.className.includes('flex items-center space-x-4')
    );
    expect(sidebarItems.length).toBeGreaterThanOrEqual(6);
  });

  test('renders stat cards', () => {
    render(<DashboardSkeleton />);
    
    const statCards = screen.getAllByRole('generic').filter(
      element => element.className.includes('bg-white p-6 rounded-lg shadow')
    );
    expect(statCards.length).toBeGreaterThanOrEqual(4);
  });

  test('renders chart placeholders', () => {
    render(<DashboardSkeleton />);
    
    const chartContainers = screen.getAllByRole('generic').filter(
      element => element.className.includes('h-64 bg-gray-200 rounded')
    );
    expect(chartContainers).toHaveLength(2);
  });

  test('renders activity list placeholders', () => {
    render(<DashboardSkeleton />);
    
    const activityItems = screen.getAllByRole('generic').filter(
      element => element.className.includes('flex items-center')
    );
    expect(activityItems.length).toBeGreaterThanOrEqual(5);
  });

  test('renders footer links placeholders', () => {
    render(<DashboardSkeleton />);
    
    const footerLinks = screen.getAllByRole('generic').filter(
      element => element.className.includes('h-4 w-24 bg-gray-200 rounded')
    );
    expect(footerLinks).toHaveLength(3);
  });
});