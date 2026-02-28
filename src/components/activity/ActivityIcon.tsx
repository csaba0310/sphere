import { ShoppingBag, ArrowRightLeft, Wallet, Gamepad2, ShoppingCart, Tag, Wrench, Megaphone, Sparkles } from 'lucide-react';
import type { ActivityKind } from '../../types/activity';

interface ActivityIconProps {
  kind: ActivityKind;
  className?: string;
  size?: 'sm' | 'md';
}

const iconConfig: Record<ActivityKind, { icon: typeof ShoppingBag; bg: string; color: string }> = {
  marketplace_post: {
    icon: ShoppingBag,
    bg: 'bg-orange-500/15 dark:bg-[rgba(255,111,0,0.12)]',
    color: 'text-orange-600 dark:text-brand-orange',
  },
  marketplace_offer: {
    icon: Tag,
    bg: 'bg-amber-500/15 dark:bg-[rgba(245,158,11,0.12)]',
    color: 'text-amber-600 dark:text-amber-400',
  },
  token_transfer: {
    icon: ArrowRightLeft,
    bg: 'bg-orange-400/15 dark:bg-[rgba(251,146,60,0.12)]',
    color: 'text-orange-500 dark:text-orange-400',
  },
  wallet_created: {
    icon: Wallet,
    bg: 'bg-yellow-500/15 dark:bg-[rgba(234,179,8,0.12)]',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  game_started: {
    icon: Gamepad2,
    bg: 'bg-orange-600/15 dark:bg-[rgba(234,88,12,0.12)]',
    color: 'text-orange-600 dark:text-orange-400',
  },
  merch_order: {
    icon: ShoppingCart,
    bg: 'bg-amber-600/15 dark:bg-[rgba(217,119,6,0.12)]',
    color: 'text-amber-600 dark:text-amber-400',
  },
};

// Intent type icon config for market feed listings
const intentIconConfig: Record<string, { icon: typeof ShoppingBag; bg: string; color: string }> = {
  sell: {
    icon: Tag,
    bg: 'bg-orange-500/15 dark:bg-[rgba(255,111,0,0.12)]',
    color: 'text-orange-600 dark:text-brand-orange',
  },
  buy: {
    icon: ShoppingCart,
    bg: 'bg-amber-500/15 dark:bg-[rgba(245,158,11,0.12)]',
    color: 'text-amber-600 dark:text-amber-400',
  },
  service: {
    icon: Wrench,
    bg: 'bg-orange-400/15 dark:bg-[rgba(251,146,60,0.12)]',
    color: 'text-orange-500 dark:text-orange-400',
  },
  announcement: {
    icon: Megaphone,
    bg: 'bg-yellow-500/15 dark:bg-[rgba(234,179,8,0.12)]',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  other: {
    icon: Sparkles,
    bg: 'bg-orange-600/15 dark:bg-[rgba(234,88,12,0.12)]',
    color: 'text-orange-600 dark:text-orange-400',
  },
};

const defaultIntentIcon = intentIconConfig.other;

export function ActivityIcon({ kind, className = '', size = 'md' }: ActivityIconProps) {
  const config = iconConfig[kind] || iconConfig.wallet_created;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 rounded-full'
    : 'w-8 h-8 rounded-full';

  const iconSizeClasses = size === 'sm'
    ? 'w-3 h-3'
    : 'w-4 h-4';

  return (
    <div className={`${sizeClasses} ${config.bg} flex items-center justify-center ${className}`}>
      <Icon className={`${iconSizeClasses} ${config.color}`} />
    </div>
  );
}

interface IntentIconProps {
  intentType: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function IntentIcon({ intentType, className = '', size = 'md' }: IntentIconProps) {
  const config = intentIconConfig[intentType] || defaultIntentIcon;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 rounded-full'
    : 'w-8 h-8 rounded-full';

  const iconSizeClasses = size === 'sm'
    ? 'w-3 h-3'
    : 'w-4 h-4';

  return (
    <div className={`${sizeClasses} ${config.bg} flex items-center justify-center ${className}`}>
      <Icon className={`${iconSizeClasses} ${config.color}`} />
    </div>
  );
}
