import React, { useState, useEffect } from 'react';
import { ComplianceService } from '../services/complianceService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ComplianceSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceSettings();
  }, []);

  const fetchComplianceSettings = async () => {
    try {
      const data = await ComplianceService.getComplianceSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch compliance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ComplianceService.updateComplianceSettings(settings);
      setError(null);
    } catch (err) {
      setError('Failed to update compliance settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!settings) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Compliance Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
          <input
            type="number"
            value={settings.minimumAge}
            onChange={(e) => handleSettingChange('minimumAge', parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Daily Wager</label>
          <input
            type="number"
            value={settings.maxDailyWager}
            onChange={(e) => handleSettingChange('maxDailyWager', parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Restricted Jurisdictions</label>
          <input
            type="text"
            value={settings.restrictedJurisdictions.join(', ')}
            onChange={(e) => handleSettingChange('restrictedJurisdictions', e.target.value.split(', '))}
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

export default ComplianceSettings;