import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Target, ThumbsUp, Plus, Check } from 'lucide-react';
import type { ProjectSummary, ProjectMetrics } from '../../services/marketplaceApi';
import { useInstalledProjects } from '../../hooks/useInstalledProjects';

interface ProjectCardProps {
  project: ProjectSummary;
  index?: number;
  /** Live metrics from /api/metrics/projects — overrides the denormalized project.stats snapshot */
  metrics?: ProjectMetrics;
}

const categoryLabels: Record<string, string> = {
  game: 'Game', defi: 'DeFi', social: 'Social', tool: 'Tool', nft: 'NFT', other: 'Other',
};

export function ProjectCard({ project, index = 0, metrics }: ProjectCardProps) {
  const { isInstalled, toggle } = useInstalledProjects();
  const installed = isInstalled(project.slug);
  const users   = metrics?.uniqueUsers  ?? project.stats.totalUsers;
  const quests  = metrics?.activeQuests ?? project.stats.activeQuests;
  const positivePct = metrics?.positivePercent ?? 0;
  const ratingCount = metrics?.ratingCount ?? 0;

  const handleInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(project.slug);
  };

  const hasBanner = !!project.bannerUrl;

  return (
    <Link to={`/apps/${project.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -4 }}
        className="no-text-shadow group rounded-2xl border border-neutral-200 dark:border-white/8 hover:border-orange-500/60 dark:hover:border-brand-orange/60 hover:shadow-lg hover:shadow-orange-500/10 dark:hover:shadow-brand-orange/15 transition-all duration-200 cursor-pointer relative overflow-hidden"
      >
        {/* Banner background — fixed height for uniform card size */}
        <div className="relative h-24 overflow-hidden">
          {hasBanner ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${project.bannerUrl})` }}
              />
              <div className="absolute inset-0" style={{
                background: `linear-gradient(to bottom, ${project.accentColor}33 0%, ${project.accentColor}99 100%)`,
              }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, ${project.accentColor}cc 0%, ${project.accentColor}44 100%)`,
            }} />
          )}

          {/* Install button */}
          <button
            onClick={handleInstall}
            title={installed ? 'Remove from Desktop' : 'Add to Desktop'}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all ${
              installed
                ? 'bg-green-500/30 text-white border border-green-400/40'
                : 'bg-black/30 text-white/70 border border-white/15 hover:bg-orange-500/40 hover:text-white hover:border-orange-400/40'
            }`}
          >
            {installed ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 bg-white dark:bg-white/4 dark:backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-start gap-3">
            <img
              src={project.logoUrl}
              alt={project.name}
              className="w-11 h-11 rounded-xl object-cover border border-neutral-200 dark:border-white/10 shrink-0 -mt-8 ring-2 ring-white dark:ring-[#0a0a0a] shadow-lg relative z-10"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/44x44/${project.accentColor.slice(1)}/white?text=${project.name[0]}`; }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm truncate">{project.name}</h3>
              <p className="text-neutral-500 dark:text-white/45 text-xs mt-0.5 h-8 line-clamp-2">{project.tagline}</p>
            </div>
          </div>

          {/* Category + Stats — fixed layout */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border" style={{
              backgroundColor: `${project.accentColor}15`,
              color: project.accentColor,
              borderColor: `${project.accentColor}30`,
            }}>
              {categoryLabels[project.category] ?? project.category}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-white/35">
              <span className="flex items-center gap-1" title="Users"><Users className="w-3 h-3" />{users.toLocaleString()}</span>
              <span className="flex items-center gap-1" title="Active quests"><Target className="w-3 h-3" />{quests.toLocaleString()}</span>
              {ratingCount > 0 && (
                <span className="flex items-center gap-1" title={`${ratingCount} reviews`}>
                  <ThumbsUp className="w-3 h-3" />{positivePct}%
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
