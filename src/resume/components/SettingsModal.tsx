import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = React.memo(function SettingsModal({ onClose }: SettingsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Resume settings"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button onClick={onClose} className="p-2 text-gray-400 rounded-full transition-colors hover:text-gray-600" aria-label="Close settings">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Resume builder settings coming soon.</p>
        </div>
        <div className="flex justify-end p-4 border-t">
          <button onClick={onClose} className="btn-primary px-4 py-2">
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});