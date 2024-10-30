import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface SecurityMetrics {
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
  };
  lastAuditDate: string;
  securityScore: number;
  failedLoginAttempts: number;
  suspiciousActivities: number;
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/security-metrics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch security metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityCard
          icon={<Shield className="text-blue-500" />}
          title="Security Score"
          value={`${metrics.securityScore}%`}
          color={metrics.securityScore > 80 ? 'text-green-500' : 'text-yellow-500'}
        />
        <SecurityCard
          icon={<AlertTriangle className="text-red-500" />}
          title="High Vulnerabilities"
          value={metrics.vulnerabilities.high}
          color="text-red-500"
        />
        <SecurityCard
          icon={<AlertTriangle className="text-yellow-500" />}
          title="Medium Vulnerabilities"
          value={metrics.vulnerabilities.medium}
          color="text-yellow-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" />
            <span>{metrics.failedLoginAttempts} failed login attempts in the last 24 hours</span>
          </li>
          <li className="flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" />
            <span>{metrics.suspiciousActivities} suspicious activities detected</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="text-green-500 mr-2" />
            <span>Last security audit: {new Date(metrics.lastAuditDate).toLocaleDateString()}</span>
          </li>
        </ul>
      </div>

      <button
        onClick={fetchSecurityMetrics}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Refresh Security Metrics
      </button>
    </div>
  );
};

interface SecurityCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const SecurityCard: React.FC<SecurityCardProps> = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center">
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
);

export default SecurityDashboard;