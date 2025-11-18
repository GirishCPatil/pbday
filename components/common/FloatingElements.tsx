
import React, { useMemo } from 'react';

type ElementType = 'balloon' | 'confetti' | 'sparkle' | 'heart' | 'bokeh' | 'confetti-burst';

interface FloatingElementsProps {
  count: number;
  type: ElementType;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ count, type }) => {
  const elements = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const style: React.CSSProperties = {};
      const duration = Math.random() * 10 + 8; // 8-18 seconds
      const delay = Math.random() * -15; // Start at different times
      const left = Math.random() * 100;

      style.left = `${left}vw`;
      style.animationDelay = `${delay}s`;

      switch (type) {
        case 'balloon':
          const size = Math.random() * 60 + 40; // 40-100px
          const baseColors = ['#fca5a5', '#fcd34d', '#ffffff']; // Corresponds to rose-300, amber-300, white
          const color = baseColors[i % 3];
          const threadLength = Math.random() * 80 + 60; // 60-140px
      
          style.animationDuration = `${duration + 10}s`; // Slower float
      
          // The main container handles the overall floating animation
          return (
              <div
                  key={i}
                  className={`absolute bottom-[-300px] animate-float-up flex flex-col items-center`}
                  style={style}
              >
                  {/* The balloon body itself */}
                  <div
                      className="relative"
                      style={{
                          width: `${size}px`,
                          height: `${size * 1.2}px`,
                          backgroundColor: color,
                          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', // More balloon-like shape
                          boxShadow: 'inset -10px -10px 15px rgba(0,0,0,0.1), inset 10px 10px 15px rgba(255,255,255,0.5)', // 3D effect
                      }}
                  >
                      {/* Knot at the bottom */}
                      <div
                          className="absolute bottom-[-2px] left-1/2 -translate-x-1/2"
                          style={{
                              width: 0,
                              height: 0,
                              borderLeft: `${size * 0.07}px solid transparent`,
                              borderRight: `${size * 0.07}px solid transparent`,
                              borderTop: `${size * 0.1}px solid ${color}`,
                              filter: 'brightness(0.9)'
                          }}
                      />
                  </div>
                  {/* The thread */}
                  <div
                      className="bg-white/70 origin-top animate-sway"
                      style={{
                          width: '1px',
                          height: `${threadLength}px`,
                          animationDuration: `${Math.random() * 2 + 4}s`, // 4-6s sway cycle
                      }}
                  />
              </div>
          );
        case 'confetti':
        case 'sparkle':
          const sparkleSize = Math.random() * 8 + 4; // 4-12px
          const sparkleColors = ['bg-amber-300', 'bg-rose-200', 'bg-white'];
          style.width = `${sparkleSize}px`;
          style.height = `${sparkleSize}px`;
          style.animationDuration = `${duration}s`;
          return (
            <div
              key={i}
              className={`absolute top-[-20px] rounded-full opacity-80 animate-drift-down ${sparkleColors[i % 3]}`}
              style={style}
            />
          );
        case 'confetti-burst':
            const burstSize = Math.random() * 10 + 5; // 5-15px
            const burstColors = ['bg-amber-400', 'bg-rose-400', 'bg-white', 'bg-yellow-300', 'bg-pink-400'];
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 200 + 80; // 80-280px burst radius
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius + Math.random() * 150; // Add some gravity
            
            // Fix: Property 'setProperty' does not exist on type 'CSSProperties'.
            // Custom CSS properties in React are set directly on the style object.
            style['--tx'] = `${x}px`;
            style['--ty'] = `${y}px`;
            style.width = `${burstSize}px`;
            style.height = `${burstSize}px`;
            style.animation = `confetti-burst 1.5s ease-out forwards`;
            style.animationDelay = `0s`; // Start immediately
            style.left = '0';
            return (
                <div
                    key={i}
                    className={`absolute rounded-full ${burstColors[i % burstColors.length]}`}
                    style={style}
                />
            );
        case 'heart':
            const heartSize = Math.random() * 30 + 15; // 15-45px
            style.width = `${heartSize}px`;
            style.height = `${heartSize}px`;
            style.animationDuration = `${duration + 5}s`;
            return (
                 <div key={i} className="absolute bottom-[-50px] animate-float-up opacity-50" style={style}>
                    <svg viewBox="0 0 24 24" className="w-full h-full text-rose-300 fill-current">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                 </div>
            )
        case 'bokeh':
            const bokehSize = Math.random() * 80 + 50; // 50-130px
            const bokehColors = ['bg-rose-300/20', 'bg-amber-300/20', 'bg-white/20'];
            style.width = `${bokehSize}px`;
            style.height = `${bokehSize}px`;
            style.animation = `floatUp ${duration + 20}s linear infinite, beat 5s ease-in-out infinite`;
            style.animationDelay = `${delay}s`;
            return (
                <div key={i} className={`absolute bottom-[-150px] rounded-full filter blur-sm ${bokehColors[i % 3]}`} style={style} />
            )
        default:
          return null;
      }
    });
  }, [count, type]);

  return <>{elements}</>;
};

export default FloatingElements;