import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FinancialReports from '../../components/admin/FinancialReports';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FinancialReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders financial data correctly', async () => {
    const mockFinancialData = {
      revenue: 100000,
      expenses: 50000,
      profit: 50000,
      revenueByGame: [
        { name: 'Game 1', value: 60000 },
        { name: 'Game 2', value: 40000 },
      ],
      revenueByMonth: [
        { month: 'Jan', revenue: 30000 },
        { month: 'Feb', revenue: 35000 },
        { month: 'Mar', revenue: 35000 },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockFinancialData });

    render(<FinancialReports />);

    await waitFor(() => {
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument(); // Total Revenue
      expect(screen.getByText('$50,000')).toBeInTheDocument(); // Total Expenses
      expect(screen.getByText('$50,000')).toBeInTheDocument(); // Net Profit
    });
  });

  test('handles date range selection', async () => {
    const mockFinancialData = {
      revenue: 100000,
      expenses: 50000,
      profit: 50000,
      revenueByGame: [],
      revenueByMonth: [],
    };

    mockedAxios.get.mockResolvedValue({ data: mockFinancialData });

    render(<FinancialReports />);

    await waitFor(() => {
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    });

    // Assuming your DateRangePicker component has inputs with test-ids
    const startDateInput = screen.getByTestId('start-date-input');
    const endDateInput = screen.getByTestId('end-date-input');

    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/admin/financial-reports',
        expect.objectContaining({
          params: expect.objectContaining({
            startDate: '2023-01-01',
            endDate: '2023-12-31',
          }),
        })
      );
    });
  });

  test('handles report download', async () => {
    const mockFinancialData = {
      revenue: 100000,
      expenses: 50000,
      profit: 50000,
      revenueByGame: [],
      revenueByMonth: [],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockFinancialData });

    render(<FinancialReports />);

    await waitFor(() => {
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download report/i });
    
    // Mock the Blob and URL.createObjectURL
    const mockBlob = new Blob(['mock csv data'], { type: 'text/csv' });
    const mockUrl = 'mock-url';
    global.URL.createObjectURL = jest.fn(() => mockUrl);
    global.URL.revokeObjectURL = jest.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/admin/financial-reports/download',
        expect.objectContaining({
          responseType: 'blob',
        })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });
  });
});