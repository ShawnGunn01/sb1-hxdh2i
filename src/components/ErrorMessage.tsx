import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'toast' | 'inline';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss, 
  className = '',
  showIcon = true,
  variant = 'default'
}) => {
  const baseStyles = "rounded-md text-red-700";
  const variantStyles = {
    default: "bg-red-50 border border-red-200 p-4",
    toast: "bg-red-600 text-white shadow-lg p-4",
    inline: "bg-transparent text-sm"
  };

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {showIcon && (
          <AlertCircle 
            className={`flex-shrink-0 h-5 w-5 ${variant === 'toast' ? 'text-white' : 'text-red-400'} mr-2`}
            aria-hidden="true"
          />
        )}
        <div className="flex-1 ml-3">
          <p className={`text-sm ${variant === 'toast' ? 'text-white' : 'text-red-700'}`}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            className={`ml-3 flex-shrink-0 ${
              variant === 'toast' 
                ? 'text-white hover:text-red-100' 
                : 'text-red-400 hover:text-red-500'
            }`}
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;