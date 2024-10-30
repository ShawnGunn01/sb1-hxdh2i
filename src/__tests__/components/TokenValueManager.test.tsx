import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TokenValueManager from '../../components/TokenValueManager';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TokenValueManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders current token value', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { tokenValue: 100 } });

    render(<TokenValueManager />);

    await waitFor(() => {
      expect(screen.getByText('1 USD = 100 PLLAY Tokens')).toBeInTheDocument();
    });
  });

  test('updates token value', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { tokenValue: 100 } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<TokenValueManager />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Set New Token Value (PLLAY Tokens per 1 USD)'), { target: { value: '150' } });
      fireEvent.click(screen.getByText('Update Token Value'));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/api/token-management/value',
      { value: 150 },
      expect.any(Object)
    );
  });

  test('displays error message on failed API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<TokenValueManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch token value')).toBeInTheDocument();
    });
  });
});