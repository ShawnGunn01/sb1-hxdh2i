import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Edit, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DateRangePicker from '../components/DateRangePicker';

interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  participants: number;
  prize: number;
}

const TournamentManagement: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [page, searchTerm, dateRange]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tournaments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          page,
          limit: 10,
          search: searchTerm,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setTournaments(response.data.tournaments);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    setTournamentToDelete(tournamentId);
    setShowConfirmation(true);
  };

  const confirmDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    try {
      await axios.delete(`/api/tournaments/${tournamentToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTournaments(tournaments.filter(tournament => tournament.id !== tournamentToDelete));
      setShowConfirmation(false);
      setTournamentToDelete(null);
    } catch (err) {
      setError('Failed to delete tournament');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tournament Management</h1>
        <button
          onClick={() => navigate('/tournaments/create')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create Tournament
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Name</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Start Date</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">End Date</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Status</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Participants</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Prize</th>
              <th className="py-2 px-4 bg-gray-100 font-semibold text-gray-600 border-b border-gray-200 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200">{tournament.name}</td>
                <td className="py-2 px-4 border-b border-gray-200">{new Date(tournament.startDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-200">{new Date(tournament.endDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tournament.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">{tournament.participants}</td>
                <td className="py-2 px-4 border-b border-gray-200">${tournament.prize.toLocaleString()}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <button
                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Trophy size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/tournaments/${tournament.id}/edit`)}
                    className="text-yellow-600 hover:text-yellow-800 mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
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
        onConfirm={confirmDeleteTournament}
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This action cannot be undone."
      />
    </div>
  );
};

export default TournamentManagement;