import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../../pages/Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import { SocketProvider } from '../../contexts/SocketContext';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with data', async () => {
    const mockDashboardData = {
      activeUsers: 100,
      revenue: 10000,
      activeTournaments: 5,
      userEngagement: 75,
      recentActivities: [
        { id: '1', action: 'New user registered', time: '2023-06-01T12:00:00Z' },
      ],
      monthlyRevenue: [
        { month: 'Jan', amount: 5000 },
      ],
      gameDistribution: [
        { name: 'Game 1', value: 30 },
      ],
      dailyActiveUsers: [
        { date: '2023-06-01', count: 80 },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData });

    render(
      <MemoryRouter>
        <AuthProvider>
          <SocketProvider>
            <Dashboard />
          </SocketProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Active Users
      expect(screen.getByText('$10,000')).toBeInTheDocument(); // Revenue
      expect(screen.getByText('5')).toBeInTheDocument(); // Active Tournaments
      expect(screen.getByText('75%')).toBeInTheDocument(); // User Engagement
      expect(screen.getByText('New user registered')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <SocketProvider>
            <Dashboard />
          </SocketProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data. Please try again later.')).toBeInTheDocument();
    });
  });

  it('renders dashboard skeleton while loading', async () => {
    mockedAxios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <AuthProvider>
          <SocketProvider>
            <Dashboard />
          </SocketProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });
});