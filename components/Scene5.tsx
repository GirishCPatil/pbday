import React, { useState, useEffect } from 'react';
import FloatingElements from './common/FloatingElements';

interface Scene5Props {
  onUnlock: () => void;
}

const Scene5: React.FC<Scene5Props> = ({ onUnlock }) => {
  const [step, setStep] = useState(0);
  const [typedCode, setTypedCode] = useState('');

  // Animation timeline effect
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    switch (step) {
      case 0: // Start animation sequence
        timeouts.push(setTimeout(() => setStep(1), 500));
        break;
      case 1: // Firework shoots up
        timeouts.push(setTimeout(() => setStep(2), 1500)); // Trail animation duration
        break;
      case 2: // Firework explodes
        timeouts.push(setTimeout(() => setStep(3), 2000)); // Let burst animation play
        break;
      case 3: // Text is visible, wait before showing sign-off
        timeouts.push(setTimeout(() => setStep(4), 2500));
        break;
    }

    return () => timeouts.forEach(clearTimeout);
  }, [step]);
  
  // Secret code listener effect
  useEffect(() => {
    const secretCode = 'bubu@1819';

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore modifier keys and other non-character keys if necessary
      if (event.key.length > 1 && event.key !== 'Backspace') return;

      let currentSequence = typedCode;
      if (event.key === 'Backspace') {
          currentSequence = currentSequence.slice(0, -1);
      } else {
          currentSequence += event.key;
      }
      
      if (currentSequence.endsWith(secretCode)) {
        onUnlock();
        setTypedCode(''); // Reset after successful unlock.
      } else {
        // Keep the stored sequence no longer than the secret code itself
        // to save memory and avoid matching on long, random strings.
        setTypedCode(currentSequence.slice(-secretCode.length));
      }
    };

    // Only add listener when the prompt is visible
    if (step === 4) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [step, typedCode, onUnlock]);


  return (
    <div className="w-full h-full overflow-hidden p-4 relative">
      {/* Background stars */}
      <FloatingElements count={30} type="sparkle" />

      {/* Christmas Trees */}
      {step >= 3 && (
        <>
          <div className="absolute bottom-0 left-4 md:left-10 text-[10rem] md:text-[15rem] opacity-0 z-0" style={{ animation: 'fadeIn 2s 0.5s ease-out forwards', textShadow: '0 0 15px #22c55e' }}>
            🎄
          </div>
          <div className="absolute bottom-0 right-4 md:right-10 text-[10rem] md:text-[15rem] opacity-0 z-0" style={{ animation: 'fadeIn 2s 0.5s ease-out forwards', textShadow: '0 0 15px #22c55e' }}>
            🎄
          </div>
        </>
      )}
      
      <div className="min-h-full flex flex-col items-center justify-center text-center">
        {/* Firework Animation Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Trail */}
          {step === 1 && (
            <div
              className="w-2 h-20 bg-gradient-to-t from-amber-300 to-transparent rounded-full"
              style={{ animation: 'shoot-up 1.5s ease-out forwards' }}
            />
          )}
          
          {/* Burst */}
          {step === 2 && (
            <div className="relative w-1 h-1">
              <FloatingElements count={100} type="confetti-burst" />
            </div>
          )}

          {/* Revealed Text */}
          {step >= 3 && (
            <div className="flex flex-col items-center opacity-0" style={{ animation: step >= 3 ? 'fadeIn 1.5s 0.2s ease-out forwards' : 'none' }}>
              <h1 className="font-elegant text-5xl md:text-7xl" style={{ animation: 'firework-text 3s ease-in-out infinite' }}>
                Happy Birthday Pratiksha 💖
              </h1>
              
              {step >= 4 && (
                  <div className="opacity-0" style={{ animation: 'fadeIn 1.s ease-out forwards' }}>
                    <p className="mt-8 text-2xl text-rose-200">
                        From Girish 💞
                    </p>
                    <div className="mt-12">
                      <p className="text-rose-100 mb-4 animate-pulse">A final secret awaits...</p>
                    </div>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scene5;