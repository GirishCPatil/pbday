import React, { useState, useEffect } from 'react';

interface ApiKeyPromptProps {
  onKeySelected: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySelected }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (hasKey) {
              onKeySelected();
            } else {
              setIsChecking(false);
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
            setIsChecking(false);
        }
      } else {
        console.warn('AI Studio context not found. The API key prompt may not work.');
        // Assume we should show the prompt button anyway if the check is not available.
        setIsChecking(false);
      }
    };
    // A small timeout allows the aistudio context to initialize
    const timer = setTimeout(checkKey, 100);
    return () => clearTimeout(timer);
  }, [onKeySelected]);
  
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // As per guidelines, assume key selection is successful after triggering the dialog.
        onKeySelected();
    } else {
        alert('Could not open the API Key selection dialog. Please ensure you are in a supported environment.');
    }
  };

  if (isChecking) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1e293b] to-[#475569]">
        <div className="text-white text-xl animate-pulse">Checking API Key...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-[#1e293b] to-[#475569]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-lg animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-4">API Key Required</h1>
        <p className="text-rose-200 mb-6">
          This application uses the Gemini API, which requires an API key to function. Please select your API key to continue.
        </p>
        <button
          onClick={handleSelectKey}
          className="px-8 py-4 bg-rose-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300 animate-glow"
        >
          Select Gemini API Key
        </button>
        <p className="text-rose-300/80 mt-4 text-sm">
          For more information on billing, please visit{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            ai.google.dev/gemini-api/docs/billing
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
