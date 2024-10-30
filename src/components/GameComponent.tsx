import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface GameSession {
  id: string;
  startTime: string;
  status: 'active' | 'completed';
}

const GameComponent: React.FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGameDetails();
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/games/games/${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGame(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch game details');
    } finally {
      setLoading(false);
    }
  };

  const startGameSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/games/games/${gameId}/start-session`, {
        userId: user?.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSession(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to start game session');
    } finally {
      setLoading(false);
    }
  };

  const endGameSession = async (score: number) => {
    if (!session) return;

    try {
      setLoading(true);
      await axios.post(`/api/games/games/${gameId}/end-session`, {
        sessionId: session.id,
        score
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSession(null);
      setError(null);
    } catch (err) {
      setError('Failed to end game session');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return <div>Game not found</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
      {!session ? (
        <button
          onClick={startGameSession}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Game
        </button>
      ) : (
        <div>
          <p>Game session active</p>
          <button
            onClick={() => endGameSession(Math.floor(Math.random() * 1000))} // Replace with actual score
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
          >
            End Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameComponent;