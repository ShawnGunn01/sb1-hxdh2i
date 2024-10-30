import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DateRangePicker from '../components/DateRangePicker';
import Select from '../components/Select';
import axios from 'axios';

interface ReportData {
  userGrowth: { date: string; count: number }[];
  revenueByGame: { game: string; revenue: number }[];
  tournamentParticipation: { tournament: string; participants: number }[];
  dailyActiveUsers: { date: string; count: number }[];
  wagerDistribution: { amount: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [gameFilter, setGameFilter] = useState('all');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, gameFilter, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          game: gameFilter,
          type: reportType
        }
      });
      setReportData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get('/api/reports/download', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          game: gameFilter,
          type: reportType
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportType}_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to download report. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!reportData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <button
          onClick={handleDownloadReport}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Report
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4 items-center">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <Select
            options={[
              { value: 'all', label: 'All Games' },
              { value: 'game1', label: 'Game 1' },
              { value: 'game2', label: 'Game 2' },
              // Add more game options
            ]}
            value={gameFilter}
            onChange={setGameFilter}
          />
          <Select
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'userGrowth', label: 'User Growth' },
              { value: 'revenue', label: 'Revenue' },
              { value: 'tournaments', label: 'Tournaments' },
              { value: 'wagers', label: 'Wagers' },
            ]}
            value={reportType}
            onChange={setReportType}
          />
        </div>
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="User Growth"
            data={reportData.userGrowth}
            XAxisDataKey="date"
            YAxisDataKey="count"
            chartType="line"
          />
          <ReportChart
            title="Revenue by Game"
            data={reportData.revenueByGame}
            XAxisDataKey="game"
            YAxisDataKey="revenue"
            chartType="bar"
          />
          <ReportChart
            title="Tournament Participation"
            data={reportData.tournamentParticipation}
            XAxisDataKey="tournament"
            YAxisDataKey="participants"
            chartType="bar"
          />
          <ReportChart
            title="Daily Active Users"
            data={reportData.dailyActiveUsers}
            XAxisDataKey="date"
            YAxisDataKey="count"
            chartType="line"
          />
        </div>
      )}

      {reportType === 'userGrowth' && (
        <ReportChart
          title="User Growth"
          data={reportData.userGrowth}
          XAxisDataKey="date"
          YAxisDataKey="count"
          chartType="line"
        />
      )}

      {reportType === 'revenue' && (
        <ReportChart
          title="Revenue by Game"
          data={reportData.revenueByGame}
          XAxisDataKey="game"
          YAxisDataKey="revenue"
          chartType="bar"
        />
      )}

      {reportType === 'tournaments' && (
        <ReportChart
          title="Tournament Participation"
          data={reportData.tournamentParticipation}
          XAxisDataKey="tournament"
          YAxisDataKey="participants"
          chartType="bar"
        />
      )}

      {reportType === 'wagers' && (
        <ReportChart
          title="Wager Distribution"
          data={reportData.wagerDistribution}
          XAxisDataKey="amount"
          YAxisDataKey="count"
          chartType="pie"
        />
      )}
    </div>
  );
};

interface ReportChartProps {
  title: string;
  data: any[];
  XAxisDataKey: string;
  YAxisDataKey: string;
  chartType: 'line' | 'bar' | 'pie';
}

const ReportChart: React.FC<ReportChartProps> = ({ title, data, XAxisDataKey, YAxisDataKey, chartType }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={XAxisDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={YAxisDataKey} stroke="#8884d8" />
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={XAxisDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={YAxisDataKey} fill="#8884d8" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={YAxisDataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Reports;