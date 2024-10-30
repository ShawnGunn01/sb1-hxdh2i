import React from 'react';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

export default ScreenReaderOnly;