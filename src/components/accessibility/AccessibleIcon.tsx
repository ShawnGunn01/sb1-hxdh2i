import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

const AccessibleIcon: React.FC<AccessibleIconProps> = ({ icon: Icon, label, className }) => {
  return (
    <span className={`inline-flex items-center ${className}`} aria-hidden="true">
      <Icon />
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default AccessibleIcon;