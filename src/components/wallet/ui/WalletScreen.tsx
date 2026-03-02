import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface WalletScreenProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function WalletScreen({ isOpen, children, className = '' }: WalletScreenProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0.08, duration: 0.38 }}
          className={`absolute inset-0 z-10 bg-white dark:bg-modal-bg overflow-y-auto flex flex-col will-change-transform ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
