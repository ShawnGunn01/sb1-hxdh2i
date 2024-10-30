import React, { useRef, useEffect } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
}

const FocusTrap: React.FC<FocusTrapProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusableElements = ref.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    ref.current?.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
};

export default FocusTrap;