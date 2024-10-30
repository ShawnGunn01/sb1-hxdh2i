import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TokenSubscriptionManager from '../../components/TokenSubscriptionManager';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TokenSubscriptionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders active subscriptions', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [
      { id: '1', amount: 100, frequency: 'weekly', nextBillingDate: '2023-06-01' },
      { id: '2', amount: 200, frequency: 'monthly', nextBillingDate: '2023-07-01' },
    ]});

    render(<TokenSubscriptionManager />);

    await waitFor(() => {
      expect(screen.getByText('100 tokens weekly')).toBeInTheDocument();
      expect(screen.getByText('200 tokens monthly')).toBeInTheDocument();
    });
  });

  test('creates new subscription', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<TokenSubscriptionManager />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '150' } });
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'weekly' } });
      fireEvent.click(screen.getByText('Create Subscription'));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/api/token-management/subscriptions',
      { amount: 150, frequency: 'weekly' },
      expect.any(Object)
    );
  });

  test('cancels subscription', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [
      { id: '1', amount: 100, frequency: 'weekly', nextBillingDate: '2023-06-01' },
    ]});
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    render(<TokenSubscriptionManager />);

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      'http://localhost:3001/api/token-management/subscriptions/1',
      expect.any(Object)
    );
  });

  test('displays error message on failed API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<TokenSubscriptionManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch subscriptions')).toBeInTheDocument();
    });
  });
});