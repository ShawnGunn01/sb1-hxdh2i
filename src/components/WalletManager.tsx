import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Coins } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// ... (previous imports and interfaces)

const WalletManager: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversionAmount, setConversionAmount] = useState('');
  const [conversionType, setConversionType] = useState<'toTokens' | 'toCurrency'>('toTokens');
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/payments/wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWallet(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setConversionLoading(true);
      setConversionError(null);
      const endpoint = conversionType === 'toTokens' ? '/convert-to-tokens' : '/convert-to-currency';
      const payload = conversionType === 'toTokens' 
        ? { amount: parseFloat(conversionAmount) } 
        : { tokenAmount: parseInt(conversionAmount) };

      await axios.post(`http://localhost:3001/api/payments${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchWallet();
      setConversionAmount('');
    } catch (err) {
      setConversionError('Conversion failed. Please try again.');
    } finally {
      setConversionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!wallet) {
    return <div>No wallet data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Your Wallet</h2>
      {/* ... (rest of the JSX remains the same) */}
      
      <form onSubmit={handleConversion} className="space-y-4">
        {/* ... (form fields remain the same) */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={conversionLoading}
        >
          {conversionLoading ? <LoadingSpinner size={20} color="text-white" /> : 'Convert'}
        </button>
      </form>
      
      {conversionError && <ErrorMessage message={conversionError} />}
    </div>
  );
};

export default WalletManager;