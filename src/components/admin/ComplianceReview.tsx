import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

interface ComplianceReviewData {
  lastReviewDate: string;
  nextReviewDate: string;
  complianceScore: number;
  pendingUpdates: string[];
}

const ComplianceReview: React.FC = () => {
  const [reviewData, setReviewData] = useState<ComplianceReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceReviewData();
  }, []);

  const fetchComplianceReviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/compliance-review', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviewData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch compliance review data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/compliance-review', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Compliance review submitted successfully');
      fetchComplianceReviewData();
    } catch (err) {
      setError('Failed to submit compliance review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!reviewData) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Review</h2>
      {success && <SuccessMessage message={success} />}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Compliance Status</h3>
          <span className={`px-2 py-1 rounded ${
            reviewData.complianceScore >= 90 ? 'bg-green-100 text-green-800' :
            reviewData.complianceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Score: {reviewData.complianceScore}%
          </span>
        </div>
        <p><strong>Last Review:</strong> {new Date(reviewData.lastReviewDate).toLocaleDateString()}</p>
        <p><strong>Next Review:</strong> {new Date(reviewData.nextReviewDate).toLocaleDateString()}</p>
        <div className="mt-4">
          <h4 className="font-semibold">Pending Updates:</h4>
          {reviewData.pendingUpdates.length > 0 ? (
            <ul className="list-disc list-inside">
              {reviewData.pendingUpdates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          ) : (
            <p>No pending updates</p>
          )}
        </div>
      </div>

      <button
        onClick={handleReviewSubmit}
        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Submit Compliance Review
      </button>
    </div>
  );
};

export default ComplianceReview;