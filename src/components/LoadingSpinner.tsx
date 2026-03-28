
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = "Loading..." }: LoadingSpinnerProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl max-w-sm mx-4">
        {/* Modern fintech spinner */}
        <div className="relative w-16 h-16 mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-accent animate-spin"></div>
          {/* Inner pulsing dot */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
          {/* Center dot */}
          <div className="absolute inset-6 rounded-full bg-white"></div>
        </div>

        {/* Loading text with animation */}
        <div className="text-center space-y-2">
          <p className="text-gray-700 text-lg font-semibold animate-fade-in">{message}</p>
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
