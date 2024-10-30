import React, { useState, useEffect } from 'react';
import { Shield, Save } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

interface ComplianceSettingsData {
  minAge: number;
  maxDailyWager: number;
  maxWeeklyWager: number;
  maxMonthlyWager: number;
  selfExclusionPeriods: number[];
  restrictedCountries: string[];
  kycRequirements: string[];
  dataRetentionPeriod: number;
}

const ComplianceSettings: React.FC = () => {
  const [settings, setSettings] = useState<ComplianceSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceSettings();
  }, []);

  const fetchComplianceSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/compliance-settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch compliance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: Number(value) } : null);
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof ComplianceSettingsData) => {
    const { value } = e.target;
    setSettings(prev => {
      if (!prev) return null;
      const newArray = [...prev[field]] as any[];
      if (field === 'selfExclusionPeriods') {
        newArray[index] = Number(value);
      } else {
        newArray[index] = value;
      }
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/api/admin/compliance-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Compliance settings updated successfully');
      setError(null);
    } catch (err) {
      setError('Failed to update compliance settings');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Settings</h2>
      {success && <SuccessMessage message={success} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing fields */}
        {/* ... */}

        {/* New fields */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">KYC Requirements</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {settings.kycRequirements.map((requirement, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayInputChange(e, index, 'kycRequirements')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Data Retention</h3>
          <div>
            <label htmlFor="dataRetentionPeriod" className="block text-sm font-medium text-gray-700">Data Retention Period (months)</label>
            <input
              type="number"
              id="dataRetentionPeriod"
              name="dataRetentionPeriod"
              value={settings.dataRetentionPeriod}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplianceSettings;