import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const KYCForm: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idFrontImage, setIdFrontImage] = useState('');
  const [idBackImage, setIdBackImage] = useState('');
  const [selfieImage, setSelfieImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await axios.get('/api/kyc/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setKycStatus(response.data.status);
    } catch (err) {
      setError('Failed to fetch KYC status');
    }
  };

  const handleImageUpload = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const kycData = {
      fullName,
      dateOfBirth,
      address,
      idNumber,
      idFrontImage,
      idBackImage,
      selfieImage
    };

    try {
      const response = await axios.post('/api/kyc/submit', kycData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setKycStatus(response.data.status);
    } catch (err) {
      setError('Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (kycStatus === 'approved') {
    return <div className="text-green-600">Your KYC has been approved.</div>;
  }

  if (kycStatus === 'pending') {
    return <div className="text-yellow-600">Your KYC is pending approval.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (previous input fields remain the same) */}
      <div>
        <label htmlFor="idFront" className="block text-sm font-medium text-gray-700">ID Front</label>
        <input
          type="file"
          id="idFront"
          onChange={handleImageUpload(setIdFrontImage)}
          required
          className="mt-1 block w-full"
          accept="image/*"
        />
      </div>
      <div>
        <label htmlFor="idBack" className="block text-sm font-medium text-gray-700">ID Back</label>
        <input
          type="file"
          id="idBack"
          onChange={handleImageUpload(setIdBackImage)}
          required
          className="mt-1 block w-full"
          accept="image/*"
        />
      </div>
      <div>
        <label htmlFor="selfie" className="block text-sm font-medium text-gray-700">Selfie</label>
        <input
          type="file"
          id="selfie"
          onChange={handleImageUpload(setSelfieImage)}
          required
          className="mt-1 block w-full"
          accept="image/*"
        />
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Submit KYC
      </button>
    </form>
  );
};

export default KYCForm;