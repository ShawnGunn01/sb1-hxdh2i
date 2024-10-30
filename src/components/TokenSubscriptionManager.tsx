import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Repeat, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Subscription {
  id: string;
  amount: number;
  frequency: 'weekly' | 'monthly';
  nextBillingDate: string;
}

const TokenSubscriptionManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubscription, setNewSubscription] = useState({ amount: '', frequency: 'monthly' });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/token-management/subscriptions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubscriptions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/token-management/subscriptions', 
        { amount: parseFloat(newSubscription.amount), frequency: newSubscription.frequency },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchSubscriptions();
      setNewSubscription({ amount: '', frequency: 'monthly' });
      setError(null);
    } catch (err) {
      setError('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/token-management/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchSubscriptions();
      setError(null);
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Token Subscriptions</h2>

      <form onSubmit={handleCreateSubscription} className="mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={newSubscription.amount}
            onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
            placeholder="Amount"
            className="flex-grow border rounded px-3 py-2"
            required
          />
          <select
            value={newSubscription.frequency}
            onChange={(e) => setNewSubscription({ ...newSubscription, frequency: e.target.value as 'weekly' | 'monthly' })}
            className="border rounded px-3 py-2"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Subscription
          </button>
        </div>
      </form>

      {subscriptions.length === 0 ? (
        <p>No active subscriptions</p>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((sub) => (
            <li key={sub.id} className="flex items-center justify-between bg-gray-100 p-4 rounded">
              <div>
                <p className="font-semibold">{sub.amount} tokens {sub.frequency}</p>
                <p className="text-sm text-gray-600">Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleCancelSubscription(sub.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default TokenSubscriptionManager;