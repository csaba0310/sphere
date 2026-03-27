import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects, useFeaturedProjects } from '../hooks/useMarketplace';
import { FeaturedProjectCard } from '../components/marketplace/FeaturedProjectCard';
import { ProjectCard } from '../components/marketplace/ProjectCard';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_CATEGORIES = ['game', 'defi', 'social', 'tool'];
const SKILL_CATEGORIES = ['utility', 'defi', 'trading', 'social', 'developer', 'nft'];

type ExploreTab = 'apps' | 'skills';

// ─── Drag-scrollable Featured Carousel ────────────────────────────────────────

function FeaturedCarousel({ items }: { items: { slug: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const moved = useRef(false);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    // Reset moved flag after a tick so onClickCapture can still block the current click
    setTimeout(() => { moved.current = false; }, 0);
  }, []);

  // Global mouseup to prevent stuck drag when mouse leaves window
  useEffect(() => {
    window.addEventListener('mouseup', stopDrag);
    return () => window.removeEventListener('mouseup', stopDrag);
  }, [stopDrag]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    moved.current = false;
    startX.current = e.pageX;
    scrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    if (Math.abs(walk) > 5) moved.current = true;
  }, []);

  return (
    <div
      ref={scrollRef}
      onDragStart={e => e.preventDefault()}
      onMouseDown={e => { e.preventDefault(); onMouseDown(e); }}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onClickCapture={(e) => { if (moved.current) { e.preventDefault(); e.stopPropagation(); } }}
      className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 select-none"
      style={{ cursor: 'grab' }}
    >
      {(items as import('../services/marketplaceApi').ProjectSummary[]).map((project) => (
        <div key={project.slug} className="shrink-0">
          <FeaturedProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}

// ─── ExplorePage ──────────────────────────────────────────────────────────────

export function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('apps');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  // Data — filtered by active tab type
  const currentType = activeTab === 'apps' ? 'app' as const : 'skill' as const;
  const { data: projectsData, isLoading } = useProjects({ type: currentType });
  const allItems = projectsData?.projects ?? [];
  const { data: featured } = useFeaturedProjects(currentType);

  // Reset filters when switching tabs
  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    setCategory(null);
    setSearch('');
  };

  // Filtered items (same logic for both apps and skills)
  const filtered = useMemo(() => {
    let result = allItems;
    if (category) result = result.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [allItems, category, search]);

  // Featured items for current tab
  const featuredItems = featured ?? [];

  // Tab-specific config
  const categories = activeTab === 'apps' ? APP_CATEGORIES : SKILL_CATEGORIES;
  const itemLabel = activeTab === 'apps' ? 'projects' : 'skills';
  const searchPlaceholder = activeTab === 'apps' ? 'Search projects...' : 'Search skills...';

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
            {activeTab === 'apps' ? (
              <>Discover{' '}<span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Projects</span></>
            ) : (
              <>Discover{' '}<span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Skills</span></>
            )}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-base sm:text-lg text-neutral-500 dark:text-white/65 max-w-xl mx-auto leading-relaxed">
            {activeTab === 'apps'
              ? 'Games, DeFi apps, and tools built on Unicity \u2014 all accessible from your wallet.'
              : 'AI-powered plugins for Astrid \u2014 extend your assistant with new capabilities.'}
          </motion.p>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-1 w-fit p-1 rounded-lg bg-neutral-100 dark:bg-white/4 border border-neutral-200 dark:border-white/8">
            <button
              onClick={() => handleTabChange('apps')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'apps'
                  ? 'bg-orange-500 dark:bg-brand-orange text-white shadow-md shadow-orange-500/20'
                  : 'text-neutral-500 dark:text-white/45 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              Apps
            </button>
            <button
              onClick={() => handleTabChange('skills')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'skills'
                  ? 'bg-orange-500 dark:bg-brand-orange text-white shadow-md shadow-orange-500/20'
                  : 'text-neutral-500 dark:text-white/45 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Astrid Skills
            </button>
          </div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/6 border border-neutral-200 dark:border-white/8 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
          <CategoryFilter categories={categories} active={category} onChange={setCategory} />
        </div>
      </section>

      {/* Featured Carousel — drag-scrollable like MediaGallery */}
      {featuredItems.length > 0 && !category && !search && (
        <section className="px-4 sm:px-6 pb-10">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Featured <span className="text-neutral-400 dark:text-white/35 font-normal">{itemLabel}</span>
            </h2>
            <FeaturedCarousel items={featuredItems} />
          </div>
        </section>
      )}

      {/* All Items Grid */}
      <section className="px-4 sm:px-6 pb-12">
        <div>
          <h2 className="text-lg font-semibold mb-6">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} ${itemLabel}` : `All ${itemLabel}`}
            {filtered.length > 0 && <span className="text-neutral-400 dark:text-white/35 font-normal ml-2">({filtered.length})</span>}
          </h2>

          {isLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-neutral-100 dark:bg-white/4 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filtered.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-400 dark:text-white/35 text-sm">No {itemLabel} found</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-12">
        <div className="no-text-shadow max-w-3xl mx-auto bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            {activeTab === 'apps' ? 'Build on Sphere' : 'Build a Skill'}
          </h2>
          <p className="text-neutral-500 dark:text-white/45 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            {activeTab === 'apps'
              ? 'Register your project, add quests, and reach thousands of Sphere users.'
              : 'Create AI-powered plugins for Astrid and distribute them to thousands of Sphere users.'}
          </p>
          <Link
            to="/developer"
            className="inline-flex items-center gap-2 bg-orange-500 dark:bg-brand-orange hover:bg-orange-600 dark:hover:bg-brand-orange-dark text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            Developer Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
