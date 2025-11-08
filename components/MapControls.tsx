import React from 'react';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon, ImageIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}
const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onReset, onGenerateImage, isGeneratingImage }) => {
  const buttonClass = "p-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 rounded-md transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button onClick={onGenerateImage} className={buttonClass} aria-label="Generate Background Image" disabled={isGeneratingImage}>
        {isGeneratingImage ? <LoadingSpinner className="animate-spin h-5 w-5 text-white" /> : <ImageIcon className="h-5 w-5" />}
      </button>
      <button onClick={onZoomIn} className={buttonClass} aria-label="Zoom In">
        <ZoomInIcon className="h-5 w-5" />
      </button>
      <button onClick={onZoomOut} className={buttonClass} aria-label="Zoom Out">
        <ZoomOutIcon className="h-5 w-5" />
      </button>
      <button onClick={onReset} className={buttonClass} aria-label="Reset Zoom">
        <ResetZoomIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MapControls;
