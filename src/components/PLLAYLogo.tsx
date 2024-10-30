import React from 'react';

interface PLLAYLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const PLLAYLogo: React.FC<PLLAYLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'dark' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const fillColor = variant === 'light' ? '#FFFFFF' : '#000000';

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={sizeClasses[size]}
        viewBox="0 0 120 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="PLLAY Logo"
      >
        {/* First P */}
        <path 
          d="M0 0h12v40H0V0zm2 2h8v16H2V2z" 
          fill={fillColor}
        />
        {/* First L */}
        <path 
          d="M16 0h12v40H16V0zm2 22v16h8V22h-8z" 
          fill={fillColor}
        />
        {/* Second L */}
        <path 
          d="M32 0h12v40H32V0zm2 22v16h8V22h-8z" 
          fill={fillColor}
        />
        {/* A */}
        <path 
          d="M48 0h12l12 40H60L48 0zm6 13l-3 10h6l-3-10z" 
          fill={fillColor}
        />
        {/* Y */}
        <path 
          d="M76 0h12l6 20v20H82V20L76 0zm14 0l6 20v20h-12V20l6-20z" 
          fill={fillColor}
        />
        {/* Trademark */}
        <text 
          x="100" 
          y="8" 
          fontSize="6" 
          fill={fillColor}
        >
          ™
        </text>
      </svg>
    </div>
  );
};

export default PLLAYLogo;