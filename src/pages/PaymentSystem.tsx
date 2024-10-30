import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, List, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'wager' | 'winnings';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface WalletBalance {
  currency: number;
  tokens: number;
}

const PaymentSystem: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState({ amount: '', processor: 'stripe', token: '' });
  const [withdrawalRequest, setWithdrawalRequest] = useState({ amount: '', method: 'bank_transfer' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWalletBalance();
    fetchTransactions();
  }, [page]);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get('/api/payments/wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWalletBalance(response.data);
    } catch (err) {
      setError('Failed to fetch wallet balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/payments/transactions?page=${page}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/payments/deposit', newPayment, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Payment processed successfully');
      setNewPayment({ amount: '', processor: 'stripe', token: '' });
      fetchWalletBalance();
      fetchTransactions();
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/payments/withdraw', withdrawalRequest, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Withdrawal request submitted successfully');
      setWithdrawalRequest({ amount: '', method: 'bank_transfer' });
      fetchWalletBalance();
      fetchTransactions();
    } catch (err) {
      setError('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyToTokenConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/payments/convert-to-tokens', { amount: parseFloat(newPayment.amount) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Currency converted to tokens successfully');
      setNewPayment({ amount: '', processor: 'stripe', token: '' });
      fetchWalletBalance();
    } catch (err) {
      setError('Failed to convert currency to tokens');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !transactions.length) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment System</h1>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
          {walletBalance ? (
            <div>
              <p className="text-lg">Currency: ${walletBalance.currency.toFixed(2)}</p>
              <p className="text-lg">Tokens: {walletBalance.tokens}</p>
            </div>
          ) : (
            <p>Loading wallet balance...</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">New Payment</h2>
          <form onSubmit={handleNewPayment}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="amount"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="processor" className="block text-sm font-medium text-gray-700">Payment Processor</label>
              <Select
                options={[
                  { value: 'stripe', label: 'Stripe' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'cashapp', label: 'Cash App' },
                ]}
                value={newPayment.processor}
                onChange={(value) => setNewPayment({ ...newPayment, processor: value })}
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Process Payment
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Withdrawal Request</h2>
          <form onSubmit={handleWithdrawalRequest}>
            <div className="mb-4">
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="withdrawAmount"
                value={withdrawalRequest.amount}
                onChange={(e) => setWithdrawalRequest({ ...withdrawalRequest, amount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="withdrawMethod" className="block text-sm font-medium text-gray-700">Withdrawal Method</label>
              <Select
                options={[
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'crypto', label: 'Cryptocurrency' },
                ]}
                value={withdrawalRequest.method}
                onChange={(value) => setWithdrawalRequest({ ...withdrawalRequest, method: value })}
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Request Withdrawal
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Convert Currency to Tokens</h2>
          <form onSubmit={handleCurrencyToTokenConversion}>
            <div className="mb-4">
              <label htmlFor="convertAmount" className="block text-sm font-medium text-gray-700">Amount (in currency)</label>
              <input
                type="number"
                id="convertAmount"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button type="submit" className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              Convert to Tokens
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {transaction.type === 'deposit' && <ArrowUpCircle className="inline-block mr-2 text-green-500" />}
                  {transaction.type === 'withdrawal' && <ArrowDownCircle className="inline-block mr-2 text-red-500" />}
                  {transaction.type === 'wager' && <DollarSign className="inline-block mr-2 text-yellow-500" />}
                  {transaction.type === 'winnings' && <DollarSign className="inline-block mr-2 text-green-500" />}
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-sm leading-5 text-gray-500">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default PaymentSystem;