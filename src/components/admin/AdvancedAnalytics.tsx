import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, Download } from 'lucide-react';
import axios from 'axios';
import DateRangePicker from '../DateRangePicker';
import Select from '../Select';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface AnalyticsData {
  userRetention: { date: string; rate: number }[];
  lifetimeValue: { segment: string; value: number }[];
  churnRate: { date: string; rate: number }[];
  gamePopularity: { game: string; players: number }[];
  wagerDistribution: { range: string; percentage: number }[];
  peakActivityTimes: { hour: number; activity: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [segment, setSegment] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, segment]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/advanced-analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate,
          segment
        }
      });
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get('/api/admin/advanced-analytics/download', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate,
          segment
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'advanced_analytics_report.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to download report');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex space-x-4">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <Select
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'new', label: 'New Users' },
              { value: 'returning', label: 'Returning Users' },
            ]}
            value={segment}
            onChange={setSegment}
          />
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download size={18} className="mr-2" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Retention</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.userRetention}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Customer Lifetime Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.lifetimeValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Churn Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.churnRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Game Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.gamePopularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="game" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="players" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Wager Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.wagerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.wagerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Peak Activity Times</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.peakActivityTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activity" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;