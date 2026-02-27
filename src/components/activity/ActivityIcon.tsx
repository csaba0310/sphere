import { ShoppingCart, Tag, Wrench, Megaphone, Sparkles } from 'lucide-react';

// Intent type icon config for market feed listings
const intentIconConfig: Record<string, { icon: typeof Tag; bgColor: string; iconColor: string }> = {
  sell: {
    icon: Tag,
    bgColor: 'from-purple-500 to-purple-600',
    iconColor: 'text-white',
  },
  buy: {
    icon: ShoppingCart,
    bgColor: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-white',
  },
  service: {
    icon: Wrench,
    bgColor: 'from-cyan-500 to-teal-500',
    iconColor: 'text-white',
  },
  announcement: {
    icon: Megaphone,
    bgColor: 'from-amber-500 to-orange-500',
    iconColor: 'text-white',
  },
  other: {
    icon: Sparkles,
    bgColor: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-white',
  },
};

const defaultIntentIcon = intentIconConfig.other;

interface IntentIconProps {
  intentType: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function IntentIcon({ intentType, className = '', size = 'md' }: IntentIconProps) {
  const config = intentIconConfig[intentType] || defaultIntentIcon;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 rounded-md'
    : 'w-8 h-8 rounded-lg';

  const iconSizeClasses = size === 'sm'
    ? 'w-3 h-3'
    : 'w-4 h-4';

  return (
    <div className={`${sizeClasses} bg-linear-to-br ${config.bgColor} flex items-center justify-center shadow-lg ${className}`}>
      <Icon className={`${iconSizeClasses} ${config.iconColor}`} />
    </div>
  );
}
