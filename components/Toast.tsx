import React, { useEffect } from 'react';
import { Check, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Disparaît après 3 secondes
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black/90 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-xl flex items-center gap-3 border border-white/10">
        {type === 'success' ? (
           <Check className="w-4 h-4 text-[#FF385C]" strokeWidth={3} />
        ) : (
           <Info className="w-4 h-4 text-blue-400" />
        )}
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;