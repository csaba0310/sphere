import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useProjects, useFeaturedProjects } from '../hooks/useMarketplace';
import { FeaturedProjectCard } from '../components/marketplace/FeaturedProjectCard';
import { ProjectCard } from '../components/marketplace/ProjectCard';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';

const ALL_CATEGORIES = ['game', 'defi', 'social', 'tool'];

export function ExplorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { data: allProjects, isLoading } = useProjects();
  const { data: featured } = useFeaturedProjects();

  const filtered = useMemo(() => {
    if (!allProjects) return [];
    let result = allProjects;
    if (category) result = result.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return result;
  }, [allProjects, category, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neutral-900 dark:text-white">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 text-center">
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_50%_55%_at_50%_50%,rgba(0,0,0,0.5)_0%,transparent_100%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-mono uppercase tracking-widest text-orange-500 dark:text-brand-orange mb-4">
            AgentSphere / Explore
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Discover{' '}
            <span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Projects</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-base sm:text-lg text-neutral-500 dark:text-white/65 max-w-xl mx-auto leading-relaxed">
            Games, DeFi apps, and tools built on Unicity — all accessible from your wallet.
          </motion.p>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/6 border border-neutral-200 dark:border-white/8 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
          <CategoryFilter categories={ALL_CATEGORIES} active={category} onChange={setCategory} />
        </div>
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && !category && !search && (
        <section className="px-4 sm:px-6 pb-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              Featured <span className="text-neutral-400 dark:text-white/35 font-normal">projects</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {featured.map((project) => (
                <div key={project.slug} className="snap-start">
                  <FeaturedProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-6">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} projects` : 'All projects'}
            {filtered.length > 0 && <span className="text-neutral-400 dark:text-white/35 font-normal ml-2">({filtered.length})</span>}
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-neutral-100 dark:bg-white/4 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-400 dark:text-white/35 text-sm">No projects found</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-12">
        <div className="no-text-shadow max-w-3xl mx-auto bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Build on Sphere</h2>
          <p className="text-neutral-500 dark:text-white/45 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Register your project, add quests, and reach thousands of Sphere users.
          </p>
          <a
            href="http://localhost:5177"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 dark:bg-brand-orange hover:bg-orange-600 dark:hover:bg-brand-orange-dark text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            Developer Portal <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </motion.div>
  );
}
