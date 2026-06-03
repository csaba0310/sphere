import { Zap } from 'lucide-react';
import type { ProjectQuest } from '../../services/marketplaceApi';

const platformIcons: Record<string, string> = {
  TWITTER: '\u{1D54F}', DISCORD: '\u{1F4AC}', TELEGRAM: '\u2708\uFE0F', ONCHAIN: '\u26D3\uFE0F', QUIZ: '\u2753', CHECKIN: '\u{1F4CB}', EXTERNAL: '\u{1F517}',
};

interface QuestPreviewCardProps {
  quest: ProjectQuest;
  accentColor?: string;
}

export function QuestPreviewCard({ quest, accentColor = '#FF6F00' }: QuestPreviewCardProps) {
  return (
    <div className="no-text-shadow bg-white dark:bg-white/4 dark:backdrop-blur-2xl rounded-xl border border-neutral-200 dark:border-white/8 p-4 relative overflow-hidden hover:border-orange-500/40 dark:hover:border-brand-orange/40 transition-colors">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: accentColor }} />

      <div className="flex items-start gap-3">
        {/* Platform icon */}
        {quest.platform && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0" style={{
            backgroundColor: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}>
            {platformIcons[quest.platform] ?? '\u{1F4CC}'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-neutral-900 dark:text-white">{quest.title}</h4>
          <p className="text-xs text-neutral-500 dark:text-white/40 mt-0.5 line-clamp-2">{quest.description}</p>
        </div>

        {/* Points badge */}
        <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 dark:bg-brand-orange-dim text-orange-600 dark:text-brand-orange text-xs font-semibold">
          <Zap className="w-3 h-3" />
          {quest.points}
        </div>
      </div>
    </div>
  );
}
