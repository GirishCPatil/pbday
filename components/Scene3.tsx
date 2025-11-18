import React, { useState } from 'react';
import FloatingElements from './common/FloatingElements';
import { createGroupCelebrationImages } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';

interface Scene3Props {
  stylizedImageUrl: string | null;
  onNext: () => void;
}

type Step = 'upload' | 'generatingPhotos' | 'photosReady';

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
            <label htmlFor={id} className="text-rose-700 font-semibold">{label}</label>
            <div className="w-40 h-40 bg-rose-100/50 rounded-lg flex items-center justify-center border-2 border-dashed border-rose-300 overflow-hidden">
                {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/> : <span className="text-rose-400 text-sm p-2">Click to upload</span>}
            </div>
            <input id={id} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor={id} className="mt-1 px-4 py-2 bg-white/80 text-rose-600 font-semibold text-sm rounded-full shadow-md cursor-pointer hover:bg-rose-50 transition-colors">
                Select Photo 📸
            </label>
        </div>
    );
}

const Scene3: React.FC<Scene3Props> = ({ stylizedImageUrl, onNext }) => {
    const [step, setStep] = useState<Step>('upload');
    const [girishFile, setGirishFile] = useState<File | null>(null);
    const [vaishnaviFile, setVaishnaviFile] = useState<File | null>(null);
    const [girishPreview, setGirishPreview] = useState<string | null>(null);
    const [vaishnaviPreview, setVaishnaviPreview] = useState<string | null>(null);
    const [generatedPhotoUrls, setGeneratedPhotoUrls] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCelebrated, setIsCelebrated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);


    const handleFileSelect = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (file: File) => {
        setter(file);
        previewSetter(URL.createObjectURL(file));
    };

    const handleGeneratePhotos = async () => {
        if (!girishFile || !vaishnaviFile) {
            setError("Please upload both photos to continue.");
            return;
        }
        if (!stylizedImageUrl) {
            setError("An error occurred. Pratiksha's photo is missing. Please return to the previous step.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Creating your birthday memories...");
        setStep('generatingPhotos');

        const results = await createGroupCelebrationImages(girishFile, vaishnaviFile, stylizedImageUrl);
        
        setIsLoading(false);
        if (results && results.length > 0) {
            setGeneratedPhotoUrls(results);
            setStep('photosReady');
        } else {
            setError("Could not create the group photos due to a server error. Please try again in a moment.");
            setStep('upload');
        }
    };
    
    const handleCelebrate = () => {
        setIsCelebrated(true);
    };
    
    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % generatedPhotoUrls.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + generatedPhotoUrls.length) % generatedPhotoUrls.length);

    const renderContent = () => {
        switch (step) {
            case 'upload':
                return (
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 max-w-4xl w-full z-10 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-rose-800 mb-2">Add to the Celebration! 🎂</h2>
                        <p className="text-rose-700 mb-6">Upload photos of Girish & Vaishnavi to join Pratiksha.</p>
                        {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                             <ImageUploader id="girish-upload" label="Upload Girish’s Photo 📸" onFileSelect={handleFileSelect(setGirishFile, setGirishPreview)} previewUrl={girishPreview} />
                             <ImageUploader id="vaishnavi-upload" label="Upload Vaishnavi’s Photo 📸" onFileSelect={handleFileSelect(setVaishnaviFile, setVaishnaviPreview)} previewUrl={vaishnaviPreview} />
                        </div>
                        <button onClick={handleGeneratePhotos} disabled={!girishFile || !vaishnaviFile || isLoading} className="px-8 py-3 bg-amber-400 text-white font-bold rounded-full shadow-lg hover:bg-amber-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Group Photos 💫'}
                        </button>
                    </div>
                );
            
            case 'generatingPhotos':
                return (
                    <div className="flex flex-col items-center gap-4 text-rose-800">
                        <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold animate-pulse">{loadingMessage}</p>
                    </div>
                );

            case 'photosReady':
                return (
                    <div className="flex flex-col items-center gap-4 animate-pop-in w-full max-w-4xl py-4">
                        <h2 className="text-3xl font-bold text-rose-800 mb-4 z-10 drop-shadow-md">A few special moments for you!</h2>
                        
                        <div className="relative w-full">
                            {/* Image Carousel */}
                            <div className="relative aspect-video lg:aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-2xl bg-black/20 flex items-center justify-center">
                                {generatedPhotoUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Celebration ${index + 1}`}
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
                            {generatedPhotoUrls.map((_, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${index === currentImageIndex ? 'bg-rose-500 scale-125' : 'bg-rose-200'}`}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                         
                        {isCelebrated ? (
                             <button onClick={onNext} className="mt-6 px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 animate-beat z-10">
                                 Next 🎁
                             </button>
                        ) : (
                             <button onClick={handleCelebrate} className="mt-6 px-8 py-4 bg-rose-400 text-white font-bold text-xl rounded-full shadow-lg hover:bg-rose-500 transition-all duration-300 animate-glow z-10">
                                 🎉 Celebrate Now 🎉
                             </button>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center text-center p-4 relative">
            <FloatingElements count={10} type="balloon" />
            {isCelebrated && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><FloatingElements count={150} type="confetti-burst" /></div>}
            <div className="h-full w-full flex flex-col items-center justify-center overflow-y-auto">
              {renderContent()}
            </div>
        </div>
    );
};

export default Scene3;