import React from 'react';

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ targetId, children }) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-white focus:p-4 focus:text-black"
    >
      {children}
    </a>
  );
};

export default SkipLink;