import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, ShoppingBag, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, type, onClose, duration = 4000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-orange-50 text-neutral-850 border-vibrant-border font-bold',
          icon: <ShoppingBag className="h-5 w-5 text-vibrant-emerald" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      id="notification-toast"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg max-w-sm w-full md:w-auto animate-slide-in ${style.bg}`}
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-grow text-sm font-medium">{message}</div>
      <button
        id="btn-close-notification"
        onClick={onClose}
        className="flex-shrink-0 hover:bg-black/5 rounded-lg p-1 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
