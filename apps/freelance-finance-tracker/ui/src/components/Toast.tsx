import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning';
}

const bgClass = {
  success: 'var(--c-success)',
  error: 'var(--c-error)',
  warning: 'var(--c-warning)',
};

const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div role="alert" style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      background: bgClass[type], color: 'var(--c-on-success)', padding: '8px 16px',
      borderRadius: 4, zIndex: 1000,
    }}>
      {message}
    </div>
  );
};

export default Toast;
