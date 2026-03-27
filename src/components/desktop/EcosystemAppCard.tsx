import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface EcosystemAppCardProps {
  name: string;
  subtitle?: string;
  iconUrl?: string;
  accentColor?: string;
  onClick: () => void;
}

export function EcosystemAppCard({ name, subtitle, iconUrl, accentColor = '#FF6F00', onClick }: EcosystemAppCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/4 border border-neutral-200/50 dark:border-white/6 hover:border-orange-500/40 dark:hover:border-brand-orange/40 hover:bg-orange-500/4 dark:hover:bg-brand-orange-dim transition-all cursor-pointer text-left w-full group"
    >
      {/* Accent bar */}
      <div className="w-0.5 h-8 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="color:${accentColor}" class="text-sm font-bold">${name[0]}</span>`; }} />
        ) : (
          <Globe className="w-5 h-5" style={{ color: accentColor }} />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-neutral-700 dark:text-white/80 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors truncate block">{name}</span>
        {subtitle && <span className="text-[11px] text-neutral-400 dark:text-white/30 truncate block">{subtitle}</span>}
      </div>
    </motion.button>
  );
}
