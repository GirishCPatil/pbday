import React, { useState } from 'react';
import { createCouplePhotoshoot } from '../services/geminiService';
import FloatingElements from './common/FloatingElements';

// Re-usable ImageUploader component (adapted from Scene3 for dark theme)
const ImageUploader: React.FC<{
    id: string;
    label: string;
    onFileSelect: (file: File) => void;
    previewUrl: string | null;
}> = ({ id, label, onFileSelect, previewUrl }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    return (
        <div className="flex flex-col items-center gap-2">
            <label htmlFor={id} className="text-rose-200 font-semibold">{label}</label>
            <div className="w-40 h-40 bg-slate-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-rose-300/50 overflow-hidden">
                {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/> : <span className="text-rose-300 text-sm p-2 text-center">Click to upload</span>}
            </div>
            <input id={id} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor={id} className="mt-1 px-4 py-2 bg-slate-600/80 text-rose-100 font-semibold text-sm rounded-full shadow-md cursor-pointer hover:bg-slate-500 transition-colors">
                Select Photo 📸
            </label>
        </div>
    );
}

const SecretScene: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'generating' | 'viewing'>('upload');
  const [girishFile, setGirishFile] = useState<File | null>(null);
  const [pratikshaFile, setPratikshaFile] = useState<File | null>(null);
  const [girishPreview, setGirishPreview] = useState<string | null>(null);
  const [pratikshaPreview, setPratikshaPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFileSelect = (
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>, 
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => (file: File) => {
    fileSetter(file);
    previewSetter(URL.createObjectURL(file));
    setError(null);
  };

  const handleGenerateImages = async () => {
    if (!girishFile || !pratikshaFile) {
        setError("Please upload photos for both Girish and Pratiksha.");
        return;
    }
    setStep('generating');
    setError(null);
    const results = await createCouplePhotoshoot(girishFile, pratikshaFile);
    if (results && results.length > 0) {
      setGeneratedImages(results);
      setStep('viewing');
    } else {
      setError("A magical error occurred while creating your memories. Please try again.");
      setStep('upload');
    }
  };
  
  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % generatedImages.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + generatedImages.length) % generatedImages.length);

  const currentImageUrl = generatedImages.length > 0 ? generatedImages[currentImageIndex] : '';

  if (step === 'generating') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-white p-4">
        <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Crafting your special memories together...</p>
        <p className="text-rose-200">This might take a moment ✨</p>
      </div>
    );
  }

  if (step === 'upload') {
     return (
        <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center text-center p-4 relative animate-fade-in">
            <FloatingElements count={20} type="heart" />
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 max-w-4xl w-full z-10">
                <h2 className="font-romantic text-5xl text-white mb-2 drop-shadow-lg">A Final Surprise</h2>
                <p className="text-rose-200 mb-6">Let's create some final, beautiful memories together. Upload a photo of Girish and Pratiksha.</p>
                {error && <p className="mb-4 text-center text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>}
                <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                     <ImageUploader id="girish-upload" label="Upload Girish’s Photo" onFileSelect={handleFileSelect(setGirishFile, setGirishPreview)} previewUrl={girishPreview} />
                     <ImageUploader id="pratiksha-upload" label="Upload Pratiksha’s Photo" onFileSelect={handleFileSelect(setPratikshaFile, setPratikshaPreview)} previewUrl={pratikshaPreview} />
                </div>
                <button onClick={handleGenerateImages} disabled={!girishFile || !pratikshaFile} className="px-8 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed animate-glow">
                    Generate Our Adventures 💖
                </button>
            </div>
        </div>
     );
  }

  // (step === 'viewing')
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-4">
      <FloatingElements count={20} type="heart" />
      
      {/* Blurred Background */}
      <div className="absolute inset-[-20px] w-auto h-auto transition-opacity duration-1000" key={currentImageUrl}>
         <img src={currentImageUrl} className="w-full h-full object-cover filter blur-xl brightness-50 scale-110" alt="background" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <h2 className="font-romantic text-5xl md:text-6xl text-white mb-6 drop-shadow-lg animate-fade-in" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.7)'}}>
          Our Adventures Together
        </h2>
        
        {/* Carousel */}
        <div className="relative w-full max-w-sm h-[70vh] max-h-[700px] animate-pop-in">
          {/* Main Image */}
          <div className="relative w-full h-full rounded-2xl shadow-2xl bg-black/30 overflow-hidden border-4 border-white/50 flex items-center justify-center">
             {generatedImages.map((url, index) => (
                <img
                    key={index}
                    src={url}
                    alt={`Couple memory ${index + 1}`}
                    className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
          </div>

          {/* Navigation */}
          <button onClick={prevImage} className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm text-rose-800 text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
             ‹
          </button>
          <button onClick={nextImage} className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm text-rose-800 text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10">
             ›
          </button>
        </div>

        <p className="font-elegant text-3xl text-white mt-8 drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.5s'}}>
          Forever and always...
        </p>
      </div>
    </div>
  );
};

export default SecretScene;