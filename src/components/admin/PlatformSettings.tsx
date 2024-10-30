import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface PlatformSettings {
  tokenConversionRate: number;
  maxWagerAmount: number;
  minWagerAmount: number;
  platformFeePercentage: number;
}

const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PlatformSettings, value: number) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setError(null);
    } catch (err) {
      setError('Failed to update platform settings');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!settings) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Platform Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Token Conversion Rate</label>
          <input
            type="number"
            value={settings.tokenConversionRate}
            onChange={(e) => handleSettingChange('tokenConversionRate', parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Wager Amount</label>
          <input
            type="number"
            value={settings.maxWagerAmount}
            onChange={(e) => handleSettingChange('maxWagerAmount', parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Wager Amount</label>
          <input
            type="number"
            value={settings.minWagerAmount}
            onChange={(e) => handleSettingChange('minWagerAmount', parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Platform Fee Percentage</label>
          <input
            type="number"
            value={settings.platformFeePercentage}
            onChange={(e) => handleSettingChange('platformFeePercentage', parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Settings
        </button>
      </form>
    </div>
  );
};

export default PlatformSettings;