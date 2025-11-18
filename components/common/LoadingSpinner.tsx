
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-t-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p className="text-rose-800 text-lg">Stylizing your portrait...</p>
    </div>
  );
};

export default LoadingSpinner;
