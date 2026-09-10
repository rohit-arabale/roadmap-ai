import { useState, useEffect, useCallback } from 'react';

interface CustomTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom';
}

export function CustomTooltip({ children, content, position = 'top' }: CustomTooltipProps) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, dismiss]);

  return (
    <div className="inline-block relative">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap transform -translate-x-1/2 ${
          position === 'top' ? 'bottom-full mb-2 left-1/2' : 'top-full mt-2 left-1/2'
        }`} role="tooltip">
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 ${
            position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'
          }`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}