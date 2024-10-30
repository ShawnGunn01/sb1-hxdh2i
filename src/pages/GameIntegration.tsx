import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad, Plus, Edit, Trash2, Search, Play } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface Game {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  status: 'active' | 'inactive';
  popularity: number;
}

const GameIntegration: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [page, searchTerm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/games', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { page, limit: 10, search: searchTerm }
      });
      setGames(response.data.games);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    setGameToDelete(gameId);
    setShowConfirmation(true);
  };

  const confirmDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      await axios.delete(`/api/games/${gameToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGames(games.filter(game => game.id !== gameToDelete));
      setShowConfirmation(false);
      setGameToDelete(null);
    } catch (err) {
      setError('Failed to delete game');
    }
  };

  const handlePlayGame = async (gameId: string) => {
    try {
      const response = await axios.post(`/api/games/${gameId}/start-session`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/games/${gameId}/play`, { state: { sessionId: response.data.sessionId } });
    } catch (err) {
      setError('Failed to start game session');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Game Integration</h1>
        <button
          onClick={() => navigate('/games/add')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add New Game
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Name</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Description</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">API Endpoint</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Status</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Popularity</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200">{game.name}</td>
                <td className="py-2 px-4 border-b border-gray-200">{game.description}</td>
                <td className="py-2 px-4 border-b border-gray-200">{game.apiEndpoint}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    game.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {game.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">{game.popularity}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <button
                    onClick={() => handlePlayGame(game.id)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Play size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/games/${game.id}/edit`)}
                    className="text-yellow-600 hover:text-yellow-800 mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmDeleteGame}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
      />
    </div>
  );
};

export default GameIntegration;