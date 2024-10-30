import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import axios from 'axios';

interface SecurityData {
  lastSecurityAudit: string;
  twoFactorAdoption: number;
  activeSecurityAlerts: number;
  recentLoginAttempts: { ip: string; timestamp: string; success: boolean }[];
}

const AdminSecurity: React.FC = () => {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/security', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSecurityData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!securityData) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Security Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SecurityCard
          icon={<Shield size={24} />}
          title="Last Security Audit"
          value={securityData.lastSecurityAudit}
        />
        <SecurityCard
          icon={<CheckCircle size={24} />}
          title="2FA Adoption"
          value={`${securityData.twoFactorAdoption}%`}
        />
        <SecurityCard
          icon={<AlertTriangle size={24} />}
          title="Active Security Alerts"
          value={securityData.activeSecurityAlerts}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Login Attempts</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left">IP Address</th>
              <th className="text-left">Timestamp</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {securityData.recentLoginAttempts.map((attempt, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2">{attempt.ip}</td>
                <td>{new Date(attempt.timestamp).toLocaleString()}</td>
                <td>
                  {attempt.success ? (
                    <span className="text-green-500">Success</span>
                  ) : (
                    <span className="text-red-500">Failed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface SecurityCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const SecurityCard: React.FC<SecurityCardProps> = ({ icon, title, value }) => (
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

export default AdminSecurity;