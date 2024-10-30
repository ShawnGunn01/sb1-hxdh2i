import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import GameIntegration from '../../pages/GameIntegration';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GameIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders game list and handles search', async () => {
    const mockGames = {
      games: [
        { id: '1', name: 'Game 1', description: 'Description 1', apiEndpoint: 'api1', status: 'active', popularity: 100 },
        { id: '2', name: 'Game 2', description: 'Description 2', apiEndpoint: 'api2', status: 'inactive', popularity: 50 },
      ],
      totalPages: 1,
      currentPage: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockGames });

    render(
      <MemoryRouter>
        <GameIntegration />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Game Integration')).toBeInTheDocument();
      expect(screen.getByText('Game 1')).toBeInTheDocument();
      expect(screen.getByText('Game 2')).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search games...');
    fireEvent.change(searchInput, { target: { value: 'Game 1' } });

    // Mock the API call for search results
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        games: [mockGames.games[0]],
        totalPages: 1,
        currentPage: 1,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument();
      expect(screen.queryByText('Game 2')).not.toBeInTheDocument();
    });
  });

  test('handles game deletion', async () => {
    const mockGames = {
      games: [{ id: '1', name: 'Game 1', description: 'Description 1', apiEndpoint: 'api1', status: 'active', popularity: 100 }],
      totalPages: 1,
      currentPage: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockGames });

    render(
      <MemoryRouter>
        <GameIntegration />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    mockedAxios.delete.mockResolvedValueOnce({});
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Game 1')).not.toBeInTheDocument();
    });
  });
});