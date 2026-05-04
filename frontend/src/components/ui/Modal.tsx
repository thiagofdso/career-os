import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "pointer-events-auto flex w-full flex-col rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden",
                maxWidth
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto kanban-scrollbar p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
