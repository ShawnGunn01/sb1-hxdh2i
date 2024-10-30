import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const ResponsibleGaming: React.FC = () => {
  const { t } = useTranslation();
  const [dailyLimit, setDailyLimit] = useState('');
  const [weeklyLimit, setWeeklyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [exclusionDays, setExclusionDays] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/responsible-gaming/limits', {
        dailyLimit: parseFloat(dailyLimit),
        weeklyLimit: parseFloat(weeklyLimit),
        monthlyLimit: parseFloat(monthlyLimit),
      });
      setSuccess(t('responsibleGaming.limitSet'));
    } catch (err) {
      setError(t('errors.somethingWentWrong'));
    }
  };

  const handleSelfExclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/responsible-gaming/self-exclusion', {
        days: parseInt(exclusionDays),
      });
      setSuccess(t('responsibleGaming.exclusionSet'));
    } catch (err) {
      setError(t('errors.somethingWentWrong'));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('responsibleGaming.title')}</h2>
      
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{t('responsibleGaming.spendingLimits')}</h3>
        <form onSubmit={handleSetLimit} className="space-y-4">
          <div>
            <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700">
              {t('responsibleGaming.setDailyLimit')}
            </label>
            <input
              type="number"
              id="dailyLimit"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="weeklyLimit" className="block text-sm font-medium text-gray-700">
              {t('responsibleGaming.setWeeklyLimit')}
            </label>
            <input
              type="number"
              id="weeklyLimit"
              value={weeklyLimit}
              onChange={(e) => setWeeklyLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700">
              {t('responsibleGaming.setMonthlyLimit')}
            </label>
            <input
              type="number"
              id="monthlyLimit"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('responsibleGaming.submit')}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{t('responsibleGaming.selfExclusion')}</h3>
        <form onSubmit={handleSelfExclusion} className="space-y-4">
          <div>
            <label htmlFor="exclusionDays" className="block text-sm font-medium text-gray-700">
              {t('responsibleGaming.excludeFor')}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="exclusionDays"
                value={exclusionDays}
                onChange={(e) => setExclusionDays(e.target.value)}
                className="flex-1 min-w-0 block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {t('responsibleGaming.days')}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('responsibleGaming.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResponsibleGaming;