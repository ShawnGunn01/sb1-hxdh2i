import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const FeedbackForm: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post('/api/feedback', {
        userId: user?.id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Thank you for your feedback!');
      setRating(0);
      setComment('');
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">We Value Your Feedback</h2>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate your experience:</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your comments:
          </label>
          <textarea
            id="comment"
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Send size={16} className="mr-2" />
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;