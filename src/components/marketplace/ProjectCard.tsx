import { Link } from 'react-router-dom';
import { MarketplaceProjectCard } from '@unicitylabs/sphere-ui';
import type { ProjectSummary, ProjectMetrics } from '../../services/marketplaceApi';
import { useInstalledProjects } from '../../hooks/useInstalledProjects';

interface ProjectCardProps {
  project: ProjectSummary;
  /**
   * Kept for caller compatibility (e.g. ExplorePage passes the list index).
   * No longer used: sphere-ui's MarketplaceProjectCard has no entrance animation.
   */
  index?: number;
  /** Live metrics from /api/metrics/projects — overrides the denormalized project.stats snapshot */
  metrics?: ProjectMetrics;
}

export function ProjectCard({ project, metrics }: ProjectCardProps) {
  const { isInstalled, toggle } = useInstalledProjects();
  const installed = isInstalled(project.slug);
  const users = metrics?.uniqueUsers ?? project.stats.totalUsers;
  const quests = metrics?.activeQuests ?? project.stats.activeQuests;
  const positivePercent = metrics?.positivePercent ?? 0;
  const ratingCount = metrics?.ratingCount ?? 0;

  return (
    <Link to={`/apps/${project.slug}`}>
      <MarketplaceProjectCard
        name={project.name}
        tagline={project.tagline}
        logoUrl={project.logoUrl}
        bannerUrl={project.bannerUrl}
        accentColor={project.accentColor}
        category={project.category}
        users={users}
        quests={quests}
        positivePercent={positivePercent}
        ratingCount={ratingCount}
        installState={installed ? 'installed' : 'available'}
        onInstallClick={() => toggle(project.slug)}
      />
    </Link>
  );
}
