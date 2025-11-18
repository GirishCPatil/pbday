import React, { useState, useEffect } from 'react';
import { generateFoodImage, generateDoraemonImage } from '../services/geminiService';
import FloatingElements from './common/FloatingElements';

interface SceneFoodProps {
  onNext: () => void;
}

const SceneFood: React.FC<SceneFoodProps> = ({ onNext }) => {
  const [foodName, setFoodName] = useState('');
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [doraemonImageUrl, setDoraemonImageUrl] = useState<string | null>(null);
  const [isDoraemonLoading, setIsDoraemonLoading] = useState(true);

  useEffect(() => {
    const createDoraemon = async () => {
      setIsDoraemonLoading(true);
      const url = await generateDoraemonImage();
      if (url) {
        setDoraemonImageUrl(url);
      } else {
        // Handle error, maybe set a fallback or show an error message.
        console.error("Failed to load Doraemon image.");
      }
      setIsDoraemonLoading(false);
    };
    createDoraemon();
  }, []);


  const handleGenerate = async () => {
    if (!foodName.trim()) {
      setError("Please tell me what you're craving!");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await generateFoodImage(foodName);
    setIsLoading(false);
    if (result) {
      setGeneratedImageUrls(prev => [...prev, result]);
      setFoodName(''); // Clear for next entry
    } else {
      setError("The kitchen had a hiccup! A server error occurred. Please try another craving.");
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="w-full h-full p-4 flex items-center justify-center animate-fade-in overflow-hidden">
      <FloatingElements count={15} type="sparkle" />
      <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl w-full z-10 max-h-[95vh] flex flex-col lg:flex-row gap-8 overflow-y-auto">
        {/* Left side: Doraemon's Image */}
        <div className="w-full lg:w-1/3 flex-shrink-0 flex items-center justify-center bg-rose-100 rounded-xl shadow-lg">
          {isDoraemonLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
              <p className="text-rose-800 text-lg">Doraemon is arriving...</p>
            </div>
          ) : doraemonImageUrl ? (
            <img src={doraemonImageUrl} alt="Doraemon" className="w-full h-full object-cover rounded-xl"/>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-rose-500 p-4 text-center">
              Oh no! Doraemon got lost on his way here. Please try again.
            </div>
          )}
        </div>

        {/* Right side: Interactive Area */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <h2 className="text-3xl md:text-4xl font-bold text-rose-800 mb-2">Magical Birthday Feast! 🥳</h2>
          <p className="text-rose-700 mb-4">Pratiksha, what are you craving for your special day? Your wish is my command! Type it below and it will appear on the magical tablecloth.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input 
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., a cheesy pepperoni pizza..."
              className="px-4 py-3 rounded-full border-2 border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 w-full sm:flex-grow"
              disabled={isLoading}
            />
            <button onClick={handleGenerate} disabled={isLoading} className="px-6 py-3 bg-amber-400 text-white font-bold rounded-full shadow-lg hover:bg-amber-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isLoading ? 'Cooking...' : 'Generate Craving 🍲'}
            </button>
          </div>

          {error && <p className="text-red-500 my-2">{error}</p>}
          
          {/* Food Carpet */}
          <div className="relative mt-4 flex-grow w-full min-h-[40vh] rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-4 border-2 border-red-300 shadow-inner"
            style={{
              backgroundColor: '#fecaca',
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(239, 68, 68, 0.6),
                  rgba(239, 68, 68, 0.6) 1.25rem,
                  transparent 1.25rem,
                  transparent 2.5rem
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(239, 68, 68, 0.6),
                  rgba(239, 68, 68, 0.6) 1.25rem,
                  transparent 1.25rem,
                  transparent 2.5rem
                )
              `,
              backgroundSize: '2.5rem 2.5rem',
            }}
          >
              {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-t-4 border-red-200 border-t-red-400 rounded-full animate-spin"></div>
                        <p className="text-red-800 text-lg">Cooking up your craving...</p>
                    </div>
                </div>
              )}
              
              {generatedImageUrls.length === 0 && !isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center text-red-100/80 font-semibold text-center p-2 text-lg drop-shadow-md">
                      Your delicious cravings will appear here!
                  </span>
              )}

              {generatedImageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square animate-pop-in">
                  <img src={url} alt={`Generated Food ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-white/50"/>
                </div>
              ))}
          </div>

          {generatedImageUrls.length > 0 && !isLoading && (
              <button onClick={onNext} className="mt-6 self-center px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 animate-pop-in">
                  That looks delicious! What's next? 🎁
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneFood;