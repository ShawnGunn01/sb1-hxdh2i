import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TournamentManagement from '../../components/admin/TournamentManagement';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TournamentManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders tournament list and handles search', async () => {
    const mockTournaments = {
      tournaments: [
        { id: '1', name: 'Tournament 1', game: 'Game 1', startDate: '2023-07-01', endDate: '2023-07-07', status: 'upcoming', participants: 50, prizePool: 1000 },
        { id: '2', name: 'Tournament 2', game: 'Game 2', startDate: '2023-08-01', endDate: '2023-08-07', status: 'ongoing', participants: 100, prizePool: 2000 },
      ],
      totalPages: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockTournaments });

    render(<TournamentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tournament Management')).toBeInTheDocument();
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
      expect(screen.getByText('Tournament 2')).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search tournaments...');
    fireEvent.change(searchInput, { target: { value: 'Tournament 1' } });

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        tournaments: [mockTournaments.tournaments[0]],
        totalPages: 1,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
      expect(screen.queryByText('Tournament 2')).not.toBeInTheDocument();
    });
  });

  test('handles tournament deletion', async () => {
    const mockTournaments = {
      tournaments: [{ id: '1', name: 'Tournament 1', game: 'Game 1', startDate: '2023-07-01', endDate: '2023-07-07', status: 'upcoming', participants: 50, prizePool: 1000 }],
      totalPages: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockTournaments });

    render(<TournamentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    mockedAxios.delete.mockResolvedValueOnce({});
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Tournament 1')).not.toBeInTheDocument();
    });
  });
});