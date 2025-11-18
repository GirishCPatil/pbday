import React, { useState, useRef } from 'react';
import { dressUpImage } from '../services/geminiService';

interface SceneDressUpProps {
  personImageUrl: string | null;
  onNext: (newImageUrl: string) => void;
}

const LoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#FFDAB9] to-[#FFFDD0] flex flex-col items-center justify-center z-30">
      <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p className="text-rose-800 mt-4 text-xl">Styling your new look... ✨</p>
    </div>
);

const SceneDressUp: React.FC<SceneDressUpProps> = ({ personImageUrl, onNext }) => {
  const [dressFile, setDressFile] = useState<File | null>(null);
  const [dressPreviewUrl, setDressPreviewUrl] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDressFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDressPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!dressFile) {
      setError("Please upload a photo of an outfit!");
      return;
    }
    if (!personImageUrl) {
        setError("Pratiksha's photo is missing. Please go back.");
        return;
    }
    setIsLoading(true);
    setError(null);
    const result = await dressUpImage(personImageUrl, dressFile);
    setIsLoading(false);
    if (result) {
      setFinalImageUrl(result);
    } else {
      setError("Oops! The magic fizzled out due to a server error. Please try again with another dress photo.");
      setDressFile(null); // Reset on error
      setDressPreviewUrl(null);
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (finalImageUrl) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
            <h2 className="text-4xl font-bold text-rose-800 mb-4 drop-shadow-lg animate-pop-in">The Grand Reveal! ✨</h2>
            
            <div 
              className="relative w-full max-w-md h-[75vh] max-h-[800px] rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border-4 border-white/50 animate-pop-in" 
              style={{animationDelay: '0.2s'}}
            >
                 <img src={finalImageUrl} alt="Pratiksha's new look" className="w-full h-full object-contain"/>
            </div>
            
            <button 
                onClick={() => onNext(finalImageUrl)} 
                className="mt-6 px-8 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 animate-pop-in z-20"
                style={{animationDelay: '0.4s'}}
            >
                Looks great! Next 🍕
            </button>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in">
        <h2 className="text-4xl font-bold text-rose-800 mb-2">Your Personal Stylist 👗</h2>
        <p className="text-rose-700 mb-6">Click the box below to upload an outfit photo.</p>

        <div 
            className="w-full max-w-lg h-80 bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-dashed border-rose-200/50 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 hover:border-rose-300 hover:scale-105"
            onClick={() => fileInputRef.current?.click()}
        >
            {dressPreviewUrl ? (
                <img src={dressPreviewUrl} alt="Outfit Preview" className="w-full h-full object-contain"/>
            ) : (
                <div className="text-rose-600 font-semibold text-xl p-4 text-center">
                    <span className="text-5xl">🖼️</span>
                    <p className="mt-2">Click here to upload an outfit</p>
                </div>
            )}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        
        {error && <p className="text-red-500 my-4 bg-white/50 p-3 rounded-lg shadow-inner">{error}</p>}

        <button 
            onClick={handleGenerate} 
            disabled={!dressFile} 
            className="mt-8 px-10 py-4 bg-green-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
        >
            Create Magic ✨
        </button>
    </div>
  );
};

export default SceneDressUp;