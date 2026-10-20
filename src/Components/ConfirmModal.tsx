import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'Vazgeç',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-ink/25 backdrop-blur-md" onClick={onClose} />
      <div role="alertdialog" aria-modal="true" className="glass-panel bg-glass/80 dark:bg-cream/95 w-full max-w-md overflow-hidden z-10 animate-slide-up shadow-[0_20px_60px_rgba(107,76,58,0.2)]">
        <div className="p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-clay/15 text-clay border border-clay/20">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="ml-5 flex-1">
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-xl font-bold text-ink">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Kapat"
                  className="text-ink-muted hover:text-clay bg-glass/50 p-1.5 rounded-xl transition-all hover:scale-110 border border-glass/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-ink-soft leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-glass/30 border-t border-glass/50 px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button type="button" className="btn-ghost px-5 py-3 text-sm" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            autoFocus
            className="inline-flex justify-center rounded-xl px-5 py-3 bg-clay/90 hover:bg-clay text-sm font-bold text-white shadow-lg shadow-clay/25 border border-clay-deep/50 transition-all active:scale-95"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
