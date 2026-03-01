import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketFeed } from '../../hooks/useMarketFeed';
import { IntentIcon } from './ActivityIcon';
import { getIntentTitle, getIntentDescription, formatTimeAgo } from './utils';

const GEIST_MONO = "'Geist Mono', 'SF Mono', 'Fira Code', monospace";

export function ActivityTicker() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { listings: liveListings, newListingIds } = useMarketFeed();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const frozenRef = useRef<typeof liveListings | null>(null);

  // Freeze listings while an item is expanded so the ticker doesn't shift
  if (expandedId && !frozenRef.current) {
    frozenRef.current = liveListings;
  } else if (!expandedId) {
    frozenRef.current = null;
  }

  const listings = frozenRef.current ?? liveListings;

  if (listings.length === 0) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 shrink-0 overflow-hidden" style={{ fontFamily: GEIST_MONO }}>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div className="absolute w-2 h-2 rounded-full bg-orange-400 animate-ping opacity-75" />
          </div>
          <span className="text-[11px] font-semibold text-orange-500 dark:text-brand-orange uppercase tracking-wider">Live</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-28 rounded-lg bg-neutral-100/50 dark:bg-[rgba(255,255,255,0.04)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 shrink-0 overflow-hidden" style={{ fontFamily: GEIST_MONO }}>
      {/* Live / Paused badge */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${expandedId ? 'bg-neutral-400' : 'bg-orange-500'}`} />
          {!expandedId && (
            <div className="absolute w-2 h-2 rounded-full bg-orange-400 animate-ping opacity-75" />
          )}
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${expandedId ? 'text-neutral-500 dark:text-neutral-400' : 'text-orange-500 dark:text-brand-orange'}`}>
          {expandedId ? 'Paused' : 'Live'}
        </span>
      </div>

      {/* Scrollable items */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {listings.map((listing) => {
            const isNew = newListingIds.has(listing.id);
            const isExpanded = expandedId === listing.id;

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => toggleExpand(listing.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0 transition-all select-none backdrop-blur-sm ${
                  isExpanded
                    ? 'bg-neutral-200/70 dark:bg-[rgba(255,255,255,0.08)] ring-1 ring-neutral-300/60 dark:ring-[rgba(255,255,255,0.1)]'
                    : 'bg-neutral-100/50 dark:bg-[rgba(255,255,255,0.04)] hover:bg-neutral-200/60 dark:hover:bg-[rgba(255,255,255,0.07)]'
                }`}
              >
                <IntentIcon intentType={listing.type} size="sm" />
                <span className="text-[11px] font-medium text-neutral-700 dark:text-[rgba(255,255,255,0.7)] whitespace-nowrap">
                  {getIntentTitle(listing.type)}
                </span>
                <span
                  className={`text-[11px] text-neutral-500 dark:text-[rgba(255,255,255,0.4)] ${isExpanded ? '' : 'max-w-28 truncate'}`}
                >
                  {getIntentDescription(listing)}
                </span>
                <span className="text-[9px] text-neutral-400 dark:text-[rgba(255,255,255,0.25)] whitespace-nowrap">
                  {formatTimeAgo(listing.createdAt)}
                </span>
                {isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-brand-orange shrink-0" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
