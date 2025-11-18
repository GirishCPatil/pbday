
import React, { useState, useEffect } from 'react';
import FloatingElements from './common/FloatingElements';

interface Scene1Props {
  onNext: () => void;
}

const Scene1: React.FC<Scene1Props> = ({ onNext }) => {
  const [subtext, setSubtext] = useState('');
  const fullSubtext = "You make every moment special… today is all yours 💐";

  useEffect(() => {
    setSubtext('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullSubtext.length) {
        setSubtext(prev => prev + fullSubtext.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden p-4 relative">
      <FloatingElements count={10} type="balloon" />
      <FloatingElements count={20} type="sparkle" />
      <FloatingElements count={8} type="bokeh" />

      <div className="min-h-full flex flex-col items-center justify-center text-center">
        <div className="z-10 animate-fade-in">
          <h1 className="font-romantic text-6xl md:text-8xl text-rose-800 drop-shadow-lg" style={{textShadow: '2px 2px 8px rgba(183, 110, 121, 0.5)'}}>
            Happy Birthday Pratiksha 💖
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-rose-700 min-h-[3rem]">
            {subtext}
            <span className="inline-block w-1 h-6 bg-rose-700 animate-ping ml-1"></span>
          </p>

          <button 
            onClick={onNext}
            className="mt-12 w-24 h-24 rounded-full bg-rose-400 text-white flex items-center justify-center text-3xl shadow-xl animate-beat transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-rose-200"
            style={{boxShadow: '0 0 20px rgba(251, 113, 133, 0.6)'}}
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scene1;