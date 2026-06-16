import React from 'react';
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
  cancelText = 'İptal',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      <div className="glass-card bg-white/90 dark:bg-slate-900/90 rounded-3xl w-full max-w-md overflow-hidden transform transition-all z-10 animate-slide-up shadow-2xl shadow-rose-500/10">
        <div className="p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shadow-inner">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="ml-5 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-rose-500 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl transition-all hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50/50 dark:bg-slate-800/30 px-8 py-5 flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-3 gap-3 sm:gap-0 backdrop-blur-sm">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-xl border border-transparent px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:from-rose-500 hover:to-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/30 sm:ml-3 sm:w-auto transition-all hover:-translate-y-0.5 active:scale-95"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-3 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/20 sm:w-auto transition-all hover:-translate-y-0.5 active:scale-95"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
