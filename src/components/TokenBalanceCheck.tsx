import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coins } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const TokenBalanceCheck: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments/wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBalance(response.data.tokens);
      setError(null);
    } catch (err) {
      setError('Failed to fetch token balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2">
        <Coins className="text-indigo-500" size={24} />
        <div>
          <p className="text-sm text-gray-500">Current Token Balance</p>
          <p className="text-2xl font-bold">{balance} PLLAY Tokens</p>
        </div>
      </div>
    </div>
  );
};

export default TokenBalanceCheck;