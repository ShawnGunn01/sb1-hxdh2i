import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import WalletManager from '../../components/WalletManager';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WalletManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders wallet information', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { balance: 1000, tokenBalance: 5000 } });

    render(<WalletManager />);

    await waitFor(() => {
      expect(screen.getByText('Your Wallet')).toBeInTheDocument();
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
    });
  });

  test('handles conversion', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { balance: 1000, tokenBalance: 5000 } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<WalletManager />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Convert'));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/api/payments/convert-to-tokens',
      { amount: 100 },
      expect.any(Object)
    );
  });

  test('displays error message on failed API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<WalletManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch wallet data. Please try again.')).toBeInTheDocument();
    });
  });
});