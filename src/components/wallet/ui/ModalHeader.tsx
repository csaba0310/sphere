import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type IconVariant = 'gradient' | 'neutral';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  /** Icon to display in badge */
  icon?: LucideIcon;
  /** Icon badge style: 'gradient' (orange) or 'neutral' (grey) */
  iconVariant?: IconVariant;
  /** Subtitle text or ReactNode below title */
  subtitle?: ReactNode;
  /** Disable close button */
  closeDisabled?: boolean;
}

const iconVariantClasses: Record<IconVariant, { badge: string; icon: string }> = {
  gradient: {
    badge: 'bg-linear-to-br from-orange-500 to-orange-600 dark:from-brand-orange dark:to-brand-orange-dark',
    icon: 'text-white',
  },
  neutral: {
    badge: 'bg-neutral-100 dark:bg-white/6',
    icon: 'text-neutral-600 dark:text-white/45',
  },
};

export function ModalHeader({
  title,
  onClose,
  icon: Icon,
  iconVariant = 'neutral',
  subtitle,
  closeDisabled = false,
}: ModalHeaderProps) {
  const iconStyles = iconVariantClasses[iconVariant];

  return (
    <div className="relative z-10 px-6 py-3 border-b border-neutral-100 dark:border-white/6 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center ${iconStyles.badge}`}
          >
            <Icon className={`w-5 h-5 ${iconStyles.icon}`} />
          </motion.div>
        )}
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
          {subtitle && (
            <div className="text-xs text-neutral-500 dark:text-white/45">{subtitle}</div>
          )}
        </div>
      </div>

      <motion.button
        whileHover={closeDisabled ? {} : { scale: 1.1 }}
        whileTap={closeDisabled ? {} : { scale: 0.9 }}
        onClick={onClose}
        disabled={closeDisabled}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
          closeDisabled
            ? 'bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-white/28 cursor-not-allowed'
            : 'hover:bg-neutral-100 dark:hover:bg-white/6 text-neutral-400 dark:text-white/35 hover:text-neutral-700 dark:hover:text-white'
        }`}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
