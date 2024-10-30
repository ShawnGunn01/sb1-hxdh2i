import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coins } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const TokenValueManager: React.FC = () => {
  const [tokenValue, setTokenValue] = useState<number | null>(null);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokenValue();
  }, []);

  const fetchTokenValue = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/token-management/value', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTokenValue(response.data.tokenValue);
      setError(null);
    } catch (err) {
      setError('Failed to fetch token value');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/token-management/value', 
        { value: parseFloat(newValue) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchTokenValue();
      setNewValue('');
      setError(null);
    } catch (err) {
      setError('Failed to update token value');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">PLLAY Token Value Management</h2>
      <div className="mb-6">
        <p className="text-sm text-gray-600">Current Token Value</p>
        <p className="text-lg font-semibold flex items-center">
          <Coins size={18} className="mr-1" />
          1 USD = {tokenValue} PLLAY Tokens
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newTokenValue" className="block text-sm font-medium text-gray-700">
            Set New Token Value (PLLAY Tokens per 1 USD)
          </label>
          <input
            type="number"
            id="newTokenValue"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Token Value
        </button>
      </form>

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default TokenValueManager;