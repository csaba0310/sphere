import type { FeedListing } from '../../hooks/useMarketFeed';

export function getIntentTitle(type: string): string {
  switch (type) {
    case 'sell':
      return 'Selling';
    case 'buy':
      return 'Buying';
    case 'service':
      return 'Service';
    case 'announcement':
      return 'Announcement';
    default:
      return 'Intent';
  }
}

export function getIntentDescription(listing: FeedListing): string {
  return listing.title || listing.descriptionPreview || 'New intent posted';
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
