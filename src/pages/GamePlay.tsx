import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const GamePlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchGameDetails();
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      setSessionId(sessionId);
    } else {
      startGameSession();
    }
  }, [id]);

  const fetchGameDetails = async () => {
    try {
      const response = await axios.get(`/api/games/${id}`, {
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
      const response = await axios.post(`/api/games/${id}/start-session`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSessionId(response.data.sessionId);
    } catch (err) {
      setError('Failed to start game session');
    }
  };

  const endGameSession = async (score: number) => {
    try {
      await axios.post(`/api/games/${id}/end-session`, {
        sessionId,
        score
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/games/${id}`);
    } catch (err) {
      setError('Failed to end game session');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return <div>Game not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-4">{game.description}</p>
        {/* Here you would integrate the actual game component or iframe */}
        <div className="bg-gray-200 h-96 flex items-center justify-center">
          <p>Game content would be displayed here</p>
        </div>
        <button
          onClick={() => endGameSession(Math.floor(Math.random() * 1000))} // Replace with actual score
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default GamePlay;