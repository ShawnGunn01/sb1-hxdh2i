import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Copy } from 'lucide-react';
import QRCode from 'qrcode.react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import axios from 'axios';

const TwoFactorSetup: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTwoFactorSecret();
  }, []);

  const fetchTwoFactorSecret = async () => {
    try {
      const response = await axios.post('/api/auth/two-factor/setup', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSecret(response.data.secret);
      setQrCodeUrl(response.data.otpauthUrl);
    } catch (err) {
      setError('Failed to set up two-factor authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('/api/auth/two-factor/verify', 
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccessMessage('Two-factor authentication has been successfully enabled.');
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      setError('Failed to verify two-factor authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setSuccessMessage('Secret key copied to clipboard');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Set Up Two-Factor Authentication</h1>
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Scan the QR code with your authenticator app or enter the secret key manually:</p>
        <div className="flex justify-center mb-4">
          <QRCode value={qrCodeUrl} size={200} />
        </div>
        <div className="flex items-center justify-between mb-6">
          <code className="bg-gray-100 p-2 rounded">{secret}</code>
          <button onClick={handleCopySecret} className="text-indigo-600 hover:text-indigo-800">
            <Copy size={20} />
          </button>
        </div>
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verify and Enable 2FA
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorSetup;