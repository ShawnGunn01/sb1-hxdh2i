import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, color = 'text-blue-500' }) => (
  <div className="flex justify-center items-center" role="status" aria-live="polite">
    <Loader className={`animate-spin ${color}`} size={size} aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;