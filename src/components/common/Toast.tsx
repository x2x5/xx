import { useEffect } from 'react';
import { useMindMapStore } from '../../hooks/useMindMapStore';

export default function Toast() {
  const toast = useMindMapStore((s) => s.toast);
  const hideToast = useMindMapStore((s) => s.hideToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const bgColor =
    toast.type === 'error'
      ? '#f44336'
      : toast.type === 'success'
        ? '#4caf50'
        : '#2196f3';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: bgColor,
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 6,
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10001,
        animation: 'toastSlideUp 0.3s ease',
      }}
    >
      {toast.message}
    </div>
  );
}
