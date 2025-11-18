import React, { useState, useEffect, useRef } from 'react';
import { GIFTS } from '../constants';
import FloatingElements from './common/FloatingElements';

interface Scene4Props {
  onNext: () => void;
}

const Scene4: React.FC<Scene4Props> = ({ onNext }) => {
  const [step, setStep] = useState<'idle' | 'spinning' | 'presenting' | 'revealed'>('idle');
  const [rotation, setRotation] = useState(0);
  const [selectedGiftIndex, setSelectedGiftIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [wheelRadius, setWheelRadius] = useState(0);

  const segmentCount = GIFTS.length;
  const segmentAngle = 360 / segmentCount;

  // This effect runs once on mount to determine the wheel's actual rendered size.
  useEffect(() => {
    // A timeout ensures the layout has fully settled before we measure.
    const timer = setTimeout(() => {
      if (wheelContainerRef.current) {
        setWheelRadius(wheelContainerRef.current.offsetWidth / 2);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Create the conic gradient string for the wheel background with high contrast
  const conicGradient = GIFTS.map((_, index) => {
    const color = index % 2 === 0 ? '#1f2937' : '#fefce8'; // slate-800 and yellow-50
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    return `${color} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  useEffect(() => {
    if (step === 'presenting') {
      setShowConfetti(false); // Reset confetti
      
      const revealTimer = setTimeout(() => {
        setShowConfetti(true); // Trigger confetti on reveal
        setStep('revealed');
      }, 1500); // Duration of the box opening animation

      return () => clearTimeout(revealTimer);
    }
  }, [step]);

  const handleSpin = () => {
    if (step === 'spinning') return;

    setStep('spinning');
    
    const targetStopIndex = Math.floor(Math.random() * GIFTS.length);
    
    // The pointer is at the top (which corresponds to 270 degrees in a standard coordinate system).
    // We calculate the final rotation needed to align the middle of the target segment with the pointer.
    const targetAngle = 270 - (targetStopIndex * segmentAngle + segmentAngle / 2);
    
    const randomSpins = Math.floor(Math.random() * 5) + 5;
    
    // Add multiple full spins to the current rotation for a nice spinning effect.
    const currentTurns = Math.floor(rotation / 360);
    const finalRotation = (currentTurns + randomSpins) * 360 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setSelectedGiftIndex(targetStopIndex);
      setStep('presenting');
    }, 6000); // This must match the CSS transition duration
  };
  
  const selectedGift = selectedGiftIndex !== null ? GIFTS[selectedGiftIndex] : null;

  return (
    <div className="w-full h-full overflow-hidden p-4 relative animate-fade-in">
      <FloatingElements count={20} type="sparkle" />
      {showConfetti && <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"><FloatingElements count={100} type="confetti-burst" /></div>}
      
      <div className="min-h-full flex flex-col items-center justify-center text-center">
        <div className="z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-8 drop-shadow-md">
            {step === 'idle' || step === 'spinning' ? "Spin to See Your Surprise Gift 🎁" : "Here's your surprise!"}
          </h2>

          {step !== 'presenting' && step !== 'revealed' && (
            <div ref={wheelContainerRef} className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20" style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.3))' }}>
                <svg width="40" height="50" viewBox="0 0 40 50">
                    <polygon points="20,0 40,50 0,50" className="fill-current text-amber-500" />
                </svg>
              </div>
              {/* Spinner Wheel */}
              <div 
                className="relative w-full h-full transition-transform duration-[6000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Wheel Background */}
                <div 
                  className="absolute inset-0 rounded-full border-8 border-slate-800 shadow-2xl"
                  style={{ background: `conic-gradient(${conicGradient})` }}
                />
                
                {/* Wheel Labels and Hub - only render if radius is calculated */}
                {wheelRadius > 0 && (
                  <div className="absolute inset-0">
                    {/* Gift Labels */}
                    {GIFTS.map((gift, index) => {
                      const angleDeg = index * segmentAngle + segmentAngle / 2;
                      const angleRad = angleDeg * (Math.PI / 180);
                      
                      const textRadius = wheelRadius * 0.55;
                      const textContainerWidth = wheelRadius * 0.8;
                      const x = Math.cos(angleRad) * textRadius;
                      const y = Math.sin(angleRad) * textRadius;
                      
                      const textColor = index % 2 === 0 ? '#fefce8' : '#1f2937';

                      return (
                        <div
                          key={index}
                          className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center text-center"
                          style={{
                            width: `${textContainerWidth}px`,
                            color: textColor,
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angleDeg}deg)`,
                          }}
                        >
                          <span className="text-xl md:text-2xl">{gift.icon}</span>
                          <span className="mt-1 text-xs md:text-sm font-bold leading-tight break-words uppercase tracking-wider">
                            {gift.name}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-inner" style={{backgroundColor: '#fefce8', border: '3px solid #94a3b8' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {(step === 'presenting' || step === 'revealed') && selectedGift && (
              <div className="w-80 h-80 md:w-96 md:h-96 flex items-center justify-center relative perspective-[1000px]">
                  {/* Gift Box */}
                  <div className={`w-48 h-48 relative ${step === 'presenting' || step === 'revealed' ? 'animate-pop-in' : 'opacity-0'}`} style={{transformStyle: 'preserve-3d'}}>
                      {/* Gift inside */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ${step === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
                          <span className="text-6xl" style={{animation: step === 'revealed' ? 'gift-reveal 0.8s 0.2s ease-out forwards' : 'none'}}>{selectedGift.icon}</span>
                          <p className="font-semibold text-rose-800 mt-2" style={{animation: step === 'revealed' ? 'gift-reveal 0.8s 0.3s ease-out forwards' : 'none'}}>{selectedGift.name}</p>
                      </div>
                      {/* Box Base */}
                      <div className="absolute bottom-0 w-full h-3/4 bg-rose-300" />
                      {/* Lid */}
                      <div className="absolute top-0 w-full h-1/4 bg-rose-400 origin-bottom" style={{animation: step === 'presenting' ? 'lid-open 1s 0.5s ease-in-out forwards' : '', transform: step === 'revealed' ? 'translateY(-100%) rotateX(90deg)' : ''}}/>
                  </div>
              </div>
          )}
          
          {step === 'idle' && (
            <button onClick={handleSpin} className="mt-8 px-8 py-4 bg-rose-400 text-white font-bold text-xl rounded-full shadow-lg hover:bg-rose-500 transition-all duration-300 animate-glow">
              Tap to Spin 🎡
            </button>
          )}
          {step === 'spinning' && (
            <button disabled className="mt-8 px-8 py-4 bg-gray-400 text-white font-bold text-xl rounded-full shadow-lg cursor-not-allowed">
              Spinning...
            </button>
          )}
          
          {step === 'revealed' && selectedGift && (
              <div className="mt-8 p-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg animate-pop-in">
                  <p className="text-2xl text-rose-800">You got — <span className="font-bold">{selectedGift.name}!</span> 🎉</p>
                  <p className="text-lg text-rose-600 mt-2"> Dont be sad!! Claim All gifts mentioned, in real life from Girish 😘</p>
                  <button onClick={onNext} className="mt-6 px-6 py-2 bg-amber-400 text-white font-bold rounded-full shadow-md hover:bg-amber-500 transition-colors">
                      Next 💞
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scene4;
