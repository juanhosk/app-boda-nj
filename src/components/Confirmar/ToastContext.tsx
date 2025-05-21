import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface ToastContextType {
  toastMessage: string | null;
  toastType: "error" | "ok" | null;
  showToast: (message: string, type: "error" | "ok") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "ok" | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
        // Optionally reset message and type after hiding
        // setToastMessage(null);
        // setToastType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  const showToast = (message: string, type: "error" | "ok") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <ToastContext.Provider value={{ toastMessage, toastType, showToast }}>
      {children}
      {toastVisible && toastMessage && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-md shadow-lg text-white text-sm z-50
            ${toastType === 'ok' ? 'bg-green-500' : ''}
            ${toastType === 'error' ? 'bg-red-500' : ''}
          `}
        >
          {toastMessage}
          <button
            onClick={() => setToastVisible(false)}
            className="ml-4 text-white font-bold"
            aria-label="Cerrar notificación"
          >
            &times;
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};
