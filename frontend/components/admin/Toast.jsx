'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const dismiss = useCallback((id) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message, type = 'success') => {
      const id = Math.random().toString(36).slice(2);
      setItems((xs) => [...xs.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 text-sm shadow-lg ${
              t.type === 'error' ? 'border-post/40' : 'border-line'
            }`}
          >
            {t.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-post" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
            <p className="flex-1 text-body">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext).toast;
