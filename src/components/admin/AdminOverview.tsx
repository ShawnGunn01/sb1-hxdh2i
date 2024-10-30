import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, Gamepad, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import axios from 'axios';

interface OverviewData {
  totalUsers: number;
  totalRevenue: number;
  activeGames: number;
  pendingTickets: number;
  userGrowth: { date: string; count: number }[];
  revenueByGame: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminOverview: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOverviewData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!overviewData) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          icon={<Users size={24} />}
          title="Total Users"
          value={overviewData.totalUsers}
        />
        <OverviewCard
          icon={<DollarSign size={24} />}
          title="Total Revenue"
          value={`$${overviewData.totalRevenue.toLocaleString()}`}
        />
        <OverviewCard
          icon={<Gamepad size={24} />}
          title="Active Games"
          value={overviewData.activeGames}
        />
        <OverviewCard
          icon={<AlertTriangle size={24} />}
          title="Pending Support Tickets"
          value={overviewData.pendingTickets}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue by Game</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overviewData.revenueByGame}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {overviewData.revenueByGame.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface OverviewCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="p-2 bg-indigo-100 rounded-full mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminOverview;