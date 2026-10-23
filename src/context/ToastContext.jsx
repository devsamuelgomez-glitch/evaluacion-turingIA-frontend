import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);
const DURATION_MS = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((message, type = 'success') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => dismiss(id), DURATION_MS);
  }, [dismiss]);

  const value = useMemo(() => ({
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast__icon" aria-hidden="true">{toast.type === 'success' ? '✓' : '!'}</span>
            <p className="toast__message">{toast.message}</p>
            <button type="button" className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Cerrar aviso">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
