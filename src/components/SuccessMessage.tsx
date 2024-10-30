import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
    <div className="flex items-center">
      <CheckCircle className="mr-2" size={20} aria-hidden="true" />
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);

export default SuccessMessage;