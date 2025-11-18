import React, { useState, useEffect } from 'react';

const AnimatedCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isHidden) setIsHidden(false);
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      // Check if the element or its parent is interactive
      const interactiveElement = target.closest('button, a, [role="button"], input, select, textarea');
      setIsPointer(!!interactiveElement);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isHidden]);
  
  const cursorHotspot = { x: 16, y: 46 };

  return (
    <div
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transform: `translate3d(${position.x - cursorHotspot.x}px, ${position.y - cursorHotspot.y}px, 0)`,
        width: `32px`,
        height: `48px`,
      }}
    >
      <div
        className="w-full h-full transition-transform duration-200 ease-out"
        style={{ transform: isPointer ? 'scale(1.25)' : 'scale(1)' }}
      >
          <svg
            viewBox="0 0 32 48"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
          >
            <g className="animate-cursor-bob">
              <path d="M16 0 C24.8 0 32 8.9 32 20 C32 28 26 34 20 35 L12 35 C6 34 0 28 0 20 C0 8.9 7.2 0 16 0 Z" fill="#fca5a5" />
              <path d="M8 8 Q16 4 24 8 A12 12 0 0 0 8 8 Z" fill="rgba(255,255,255,0.5)" />
              <path d="M14 35 L18 35 L16 38 Z" fill="#fca5a5" />
            </g>
            <path d="M16 38 Q12 44 16 48" stroke="white" strokeWidth="1.5" fill="none" className="animate-cursor-sway" style={{ transformOrigin: '16px 38px' }} />
          </svg>
      </div>
    </div>
  );
};

export default AnimatedCursor;
