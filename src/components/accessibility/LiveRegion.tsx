import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  'aria-live'?: 'polite' | 'assertive';
}

const LiveRegion: React.FC<LiveRegionProps> = ({ message, 'aria-live': ariaLive = 'polite' }) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current) {
      regionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      className="sr-only"
      aria-live={ariaLive}
      aria-atomic="true"
    ></div>
  );
};

export default LiveRegion;