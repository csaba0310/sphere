import { Link } from 'react-router-dom';
import { FeaturedProjectCard as UiFeaturedProjectCard } from '@unicitylabs/sphere-ui';
import type { ProjectSummary, ProjectMetrics } from '../../services/marketplaceApi';

interface FeaturedProjectCardProps {
  project: ProjectSummary;
  /** Live metrics from /api/metrics/projects — overrides the denormalized project.stats snapshot */
  metrics?: ProjectMetrics;
}

export function FeaturedProjectCard({ project, metrics }: FeaturedProjectCardProps) {
  const users = metrics?.uniqueUsers ?? project.stats.totalUsers;
  const quests = metrics?.activeQuests ?? project.stats.activeQuests;
  const positivePercent = metrics?.positivePercent ?? 0;
  const ratingCount = metrics?.ratingCount ?? 0;

  return (
    <Link to={`/apps/${project.slug}`} draggable={false}>
      <UiFeaturedProjectCard
        name={project.name}
        tagline={project.tagline}
        logoUrl={project.logoUrl}
        bannerUrl={project.bannerUrl}
        accentColor={project.accentColor}
        users={users}
        quests={quests}
        positivePercent={positivePercent}
        ratingCount={ratingCount}
      />
    </Link>
  );
}
