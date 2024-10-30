import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  userId: string;
  totalWagers: number;
  wins: number;
  losses: number;
  totalAmountWagered: number;
  netProfit: number;
}

interface LeaderboardProps {
  type: 'global' | 'game';
  gameId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ type, gameId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const url = type === 'global' 
          ? 'http://localhost:3001/api/leaderboard/global'
          : `http://localhost:3001/api/leaderboard/game/${gameId}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLeaderboard(response.data.leaderboard);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, gameId]);

  if (loading) return <div className="text-center mt-4">Loading leaderboard...</div>;
  if (error) return <div className="text-center mt-4 text-red-500">{error}</div>;

  return (
    // ... (JSX remains the same)
  );
};

export default Leaderboard;