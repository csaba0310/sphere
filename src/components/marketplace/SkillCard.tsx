import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Star } from 'lucide-react';

export interface AstridSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: string;
  category: string;
  installs: number;
  rating: number;
  price: string;
  featured: boolean;
}

interface SkillCardProps {
  skill: AstridSkill;
  index?: number;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  utility: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/25' },
  defi: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/25' },
  nft: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/25' },
  trading: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/25' },
  social: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/25' },
  developer: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/25' },
};

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function SkillCard({ skill, index = 0 }: SkillCardProps) {
  const colors = categoryColors[skill.category] ?? categoryColors.utility;

  return (
    <Link to={`/skills/${skill.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="no-text-shadow group bg-white dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-5 hover:border-orange-500/60 dark:hover:border-brand-orange/60 hover:shadow-lg hover:shadow-orange-500/10 dark:hover:shadow-brand-orange/15 transition-all duration-200 flex flex-col"
    >
      {/* Header: icon + name + author */}
      <div className="flex items-start gap-3.5">
        <div className="text-3xl w-11 h-11 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 shrink-0">
          {skill.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm truncate">{skill.name}</h3>
          <p className="text-neutral-400 dark:text-white/40 text-xs mt-0.5">by {skill.author}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-neutral-500 dark:text-white/50 text-xs leading-relaxed mt-3 line-clamp-2 flex-1">
        {skill.description}
      </p>

      {/* Category badge */}
      <div className="mt-3">
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
          {skill.category}
        </span>
      </div>

      {/* Bottom row: stats + install button */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-white/35">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {formatInstalls(skill.installs)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
            {skill.rating}
          </span>
          <span className="font-medium text-neutral-500 dark:text-white/45">{skill.price}</span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all bg-orange-500/10 dark:bg-brand-orange-glass text-orange-600 dark:text-brand-orange border border-orange-500/20 dark:border-brand-orange-border hover:bg-orange-500 dark:hover:bg-brand-orange hover:text-white hover:border-orange-500 dark:hover:border-brand-orange"
        >
          Install
        </button>
      </div>
    </motion.div>
    </Link>
  );
}
