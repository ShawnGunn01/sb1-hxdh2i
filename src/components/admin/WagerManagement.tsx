import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Eye } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface WagerData {
  id: string;
  userId: string;
  opponentId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
}

const WagerManagement: React.FC = () => {
  const [wagers, setWagers] = useState<WagerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWagers();
  }, []);

  const fetchWagers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/wagers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWagers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wagers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Wager Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Opponent</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Created At</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {wagers.map(wager => (
            <tr key={wager.id}>
              <td className="py-2 px-4 border-b">{wager.id}</td>
              <td className="py-2 px-4 border-b">{wager.userId}</td>
              <td className="py-2 px-4 border-b">{wager.opponentId}</td>
              <td className="py-2 px-4 border-b">${wager.amount}</td>
              <td className="py-2 px-4 border-b">{wager.status}</td>
              <td className="py-2 px-4 border-b">{new Date(wager.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-500 hover:text-blue-700">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WagerManagement;