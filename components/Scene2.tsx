import React, { useState, useRef } from 'react';
import { stylizeImages } from '../services/geminiService';
import FloatingElements from './common/FloatingElements';

interface Scene2Props {
  onNext: (stylizedUrl: string) => void;
}

const LoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#FFDAB9] to-[#FFFDD0] flex flex-col items-center justify-center z-30">
      <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p className="text-rose-800 mt-4 text-xl">Creating your magical portraits... ✨</p>
    </div>
);


const Scene2: React.FC<Scene2Props> = ({ onNext }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stylizedUrls, setStylizedUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please upload a photo first!");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await stylizeImages(selectedFile);
    setIsLoading(false);
    if (result && result.length > 0) {
      setStylizedUrls(result);
    } else {
      setError("The magic seems to be taking a break! A server error occurred. Please try again in a moment or use a different photo.");
      setSelectedFile(null); // Reset on error
      setPreviewUrl(null);
    }
  };

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % stylizedUrls.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + stylizedUrls.length) % stylizedUrls.length);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (stylizedUrls.length > 0) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
            <h2 className="text-4xl font-bold text-rose-800 mb-2 drop-shadow-lg animate-pop-in">Your Magical Portraits! ✨</h2>
            <p className="text-rose-700 mb-4 animate-pop-in" style={{animationDelay: '0.1s'}}>Choose your favorite to continue.</p>
            
            <div className="relative w-full max-w-md">
                {/* Image Carousel */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl bg-black/20 flex items-center justify-center border-4 border-white/50">
                    {stylizedUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Stylized portrait ${index + 1}`}
                            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button onClick={prevImage} className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm text-rose-800 text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
                   ‹
                </button>
                <button onClick={nextImage} className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm text-rose-800 text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
                   ›
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-4">
                {stylizedUrls.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentImageIndex ? 'bg-rose-500 scale-125' : 'bg-rose-200'}`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>
            
            <button 
                onClick={() => onNext(stylizedUrls[currentImageIndex])} 
                className="mt-6 px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 animate-pop-in z-20"
                style={{animationDelay: '0.4s'}}
            >
                Let’s Cut the Cake 🍰
            </button>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
      <FloatingElements count={15} type="sparkle" />
      <h2 className="text-4xl font-bold text-rose-800 mb-2">Let’s Get Ready to Celebrate 🎂</h2>
      <p className="text-rose-700 mb-6">Click the box below to upload your photo.</p>

      <div 
          className="w-full max-w-lg h-80 bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-dashed border-rose-200/50 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 hover:border-rose-300 hover:scale-105"
          onClick={() => fileInputRef.current?.click()}
      >
          {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/>
          ) : (
              <div className="text-rose-600 font-semibold text-xl p-4 text-center">
                  <span className="text-5xl">🖼️</span>
                  <p className="mt-2">Click here to upload a photo</p>
              </div>
          )}
      </div>
      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
      
      {error && <p className="text-red-500 my-4 bg-white/50 p-3 rounded-lg shadow-inner">{error}</p>}

      <button 
          onClick={handleGenerate} 
          disabled={!selectedFile} 
          className="mt-8 px-10 py-4 bg-amber-400 text-white font-bold text-xl rounded-full shadow-lg hover:bg-amber-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
      >
          Create Magic ✨
      </button>
    </div>
  );
};

export default Scene2;