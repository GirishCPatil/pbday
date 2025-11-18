

import React, { useState, useEffect } from 'react';
import FloatingElements from './common/FloatingElements';

interface SceneIntroProps {
  onNext: () => void;
}

const TypingText: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (currentWordIndex >= words.length) {
        clearInterval(typingInterval);
        setTimeout(onComplete, 1000);
        return;
      }

      // More robust way to build the string to avoid "undefined"
      const nextText = words.slice(0, currentWordIndex + 1).join(' ');
      setDisplayedText(nextText);
      
      currentWordIndex++;

    }, 300);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, onComplete]);
  
  return (
    <>
      <p className="text-2xl md:text-3xl text-rose-200 min-h-[6rem] transition-opacity duration-1000" style={{textShadow: '0 0 10px rgba(251, 146, 156, 0.5)'}}>
        {displayedText}
      </p>
    </>
  );
};


const SceneIntro: React.FC<SceneIntroProps> = ({ onNext }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    
    switch (step) {
      case 0: // Initial sparkles and chime
        timeouts.push(setTimeout(() => { setStep(1); }, 1500));
        break;
      case 1: // Heart appears and pulses
        timeouts.push(setTimeout(() => setStep(2), 2500));
        break;
      // Steps 2, 3, 4 are handled by TypingText onComplete
      case 5: // Sunrise reveal
        timeouts.push(setTimeout(() => setStep(6), 3000));
        break;
    }

    return () => timeouts.forEach(clearTimeout);
  }, [step]);
  
  return (
    <div className="w-full h-full overflow-hidden p-4 relative">
        <div className="min-h-full flex flex-col items-center justify-center text-center">
            {/* Background Elements */}
            <div className={`absolute inset-0 transition-opacity duration-3000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`} style={{animation: step >= 5 ? 'sunrise 3s ease-in-out forwards' : 'none', background: 'radial-gradient(circle, #FFFDD0 0%, #FFDAB9 70%, #ffc288 100%)'}}/>
            {step >= 5 && <FloatingElements count={10} type="balloon" />}
            {step >= 5 && <FloatingElements count={8} type="bokeh" />}
            <FloatingElements count={30} type="sparkle" />

            {/* Foreground Animated Content */}
            <div className="z-10 w-full max-w-4xl">
                {step === 1 && (
                <div className="text-rose-300 text-8xl md:text-9xl animate-beat" style={{filter: 'drop-shadow(0 0 15px rgba(251, 146, 156, 0.7))'}}>
                    💖
                </div>
                )}

                {step === 2 && <TypingText text="There’s someone really special today…" onComplete={() => setStep(3)} />}
                {step === 3 && <TypingText text="Someone whose smile makes every day brighter…" onComplete={() => setStep(4)} />}
                {step === 4 && <TypingText text="And today, I celebrates her…" onComplete={() => setStep(5)} />}

                {step >= 5 && (
                    <div className="animate-fade-in" style={{animationDelay: '1s'}}>
                        <h2 className="font-elegant text-5xl md:text-7xl text-rose-800" style={{textShadow: '0 0 10px rgba(255,255,255,0.7)'}}>💖 A Special Surprise Awaits… 💖</h2>
                    </div>
                )}

                {step === 6 && (
                    <div className="mt-12 animate-pop-in flex flex-col items-center">
                        <div className="text-amber-400 text-7xl animate-beat" style={{filter: 'drop-shadow(0 0 10px gold)'}}>
                            🎁
                        </div>
                        <button 
                            onClick={onNext}
                            className="mt-4 px-8 py-4 bg-rose-400 text-white font-bold text-xl rounded-full shadow-lg hover:bg-rose-500 transition-all duration-300 animate-glow">
                            Open Your Surprise
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SceneIntro;