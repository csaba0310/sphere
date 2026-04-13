import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface RecommendBadgeProps {
  recommended: boolean;
  size?:       'sm' | 'md';
}

/**
 * Compact badge shown next to a review — green "Recommended" or red
 * "Not Recommended", matching the Steam store style.
 */
export function RecommendBadge({ recommended, size = 'md' }: RecommendBadgeProps) {
  const base = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  if (recommended) {
    return (
      <span className={`inline-flex items-center ${base} rounded-full font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-500 border border-emerald-500/30`}>
        <ThumbsUp className={iconSize} fill="currentColor" strokeWidth={1.5} />
        Recommended
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center ${base} rounded-full font-semibold uppercase tracking-wide bg-rose-500/15 text-rose-400 border border-rose-500/30`}>
      <ThumbsDown className={iconSize} fill="currentColor" strokeWidth={1.5} />
      Not Recommended
    </span>
  );
}
