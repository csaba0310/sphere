import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Users, Target } from 'lucide-react';
import type { ProjectSummary, ProjectMetrics } from '../../services/marketplaceApi';

interface FeaturedProjectCardProps {
  project: ProjectSummary;
  /** Live metrics from /api/metrics/projects — overrides the denormalized project.stats snapshot */
  metrics?: ProjectMetrics;
}

export function FeaturedProjectCard({ project, metrics }: FeaturedProjectCardProps) {
  const users   = metrics?.uniqueUsers  ?? project.stats.totalUsers;
  const quests  = metrics?.activeQuests ?? project.stats.activeQuests;
  const rating  = (project.stats as Record<string, unknown>).rating as number | undefined;

  return (
    <Link to={`/apps/${project.slug}`} draggable={false}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-72 sm:w-80 h-44 rounded-2xl overflow-hidden shrink-0 cursor-pointer group"
      >
        {/* Banner background — use bannerUrl image if available, fallback to accent gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundColor: project.accentColor,
            backgroundImage: project.bannerUrl ? `url(${project.bannerUrl})` : undefined,
          }}
        />
        {/* Color overlay — lighter when banner image is present */}
        <div className="absolute inset-0" style={{
          background: project.bannerUrl
            ? `linear-gradient(135deg, ${project.accentColor}66 0%, transparent 60%)`
            : `linear-gradient(135deg, ${project.accentColor}cc 0%, ${project.accentColor}44 100%)`,
        }} />

        {/* Gradient overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Featured badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
          <Star className="w-3 h-3" fill="currentColor" />
          Featured
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            <img
              src={project.logoUrl}
              alt={project.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x40/${project.accentColor.slice(1)}/white?text=${project.name[0]}`; }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{project.name}</h3>
              <p className="text-white/70 text-xs truncate">{project.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/60">
            <span className="flex items-center gap-1" title="Users"><Users className="w-3 h-3" />{users.toLocaleString()}</span>
            <span className="flex items-center gap-1" title="Active quests"><Target className="w-3 h-3" />{quests.toLocaleString()}</span>
            {rating != null && rating > 0 && (
              <span className="flex items-center gap-1" title="Rating"><Star className="w-3 h-3" fill="currentColor" />{rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
