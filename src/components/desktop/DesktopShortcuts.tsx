import { useNavigate, Link } from 'react-router-dom';
import { useRef, useCallback, useEffect } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { agents, type AgentConfig } from '../../config/activities';
import { useDesktopState } from '../../hooks/useDesktopState';
import { useRemoteApps, type RemoteApp } from '../../hooks/useRemoteApps';
import { useDmUnreadCount } from '../chat/hooks/useDmUnreadCount';
import { useGroupUnreadCount } from '../chat/hooks/useGroupUnreadCount';
import { useFeaturedProjects, useProjects, useProjectMetricsBatch } from '../../hooks/useMarketplace';
import { useInstalledProjects } from '../../hooks/useInstalledProjects';
import type { ProjectSummary } from '../../services/marketplaceApi';
import { DesktopIcon } from './DesktopIcon';
import { InstalledProjectIcon } from './InstalledProjectIcon';
import { FeaturedProjectCard } from '../marketplace/FeaturedProjectCard';
import { EcosystemAppCard } from './EcosystemAppCard';

// ── Sortable wrapper for InstalledProjectIcon ──────────────────────────
function SortableProjectIcon({ project }: { project: ProjectSummary }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InstalledProjectIcon project={project} />
    </div>
  );
}

// Drag-scrollable container (same pattern as MediaGallery)
function DragScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const sl = useRef(0);
  const moved = useRef(false);

  const stop = useCallback(() => {
    dragging.current = false;
    if (ref.current) ref.current.style.cursor = 'grab';
    setTimeout(() => { moved.current = false; }, 0);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, [stop]);

  return (
    <div
      ref={ref}
      onDragStart={e => e.preventDefault()}
      onMouseDown={e => { e.preventDefault(); dragging.current = true; moved.current = false; startX.current = e.pageX; sl.current = ref.current?.scrollLeft ?? 0; if (ref.current) ref.current.style.cursor = 'grabbing'; }}
      onMouseMove={e => { if (!dragging.current || !ref.current) return; e.preventDefault(); const w = (e.pageX - startX.current) * 1.2; ref.current.scrollLeft = sl.current - w; if (Math.abs(w) > 5) moved.current = true; }}
      onMouseUp={stop}
      onMouseLeave={stop}
      onClickCapture={e => { if (moved.current) { e.preventDefault(); e.stopPropagation(); } }}
      className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 select-none"
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      {children}
    </div>
  );
}

export function DesktopShortcuts() {
  const navigate = useNavigate();
  const { openTabs, openTab } = useDesktopState();
  const dmUnreadCount = useDmUnreadCount();
  const groupUnreadCount = useGroupUnreadCount();
  const { data: remoteApps } = useRemoteApps();
  const { data: featuredProjects } = useFeaturedProjects();
  const { data: projectsData } = useProjects();
  const allProjects = projectsData?.projects;
  const { installedSlugs, reorder } = useInstalledProjects();

  // Batch live metrics for every project rendered on the desktop (featured + apps list)
  const allProjectIds = [...new Set([
    ...(featuredProjects ?? []).map((p) => p._id),
    ...(allProjects ?? []).map((p) => p._id),
  ])];
  const { data: metricsByProject = {} } = useProjectMetricsBatch(allProjectIds);

  // Require 8px drag distance before activating — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Installed projects sorted in user's custom order
  const installedProjects = installedSlugs
    .map((slug) => allProjects?.find((p) => p.slug === slug))
    .filter(Boolean) as ProjectSummary[];

  // Ecosystem: remote apps + non-featured, non-installed, non-skill marketplace projects
  const ecosystemProjects = allProjects?.filter(
    (p) => !p.featured && !installedSlugs.includes(p.slug) && (p as Record<string, unknown>).type !== 'skill',
  ) ?? [];

  const openAppIds = new Set(openTabs.map((t) => t.appId));

  const getBadge = (agentId: string): number | undefined => {
    if (agentId === 'dm') return dmUnreadCount || undefined;
    if (agentId === 'group-chat') return groupUnreadCount || undefined;
    return undefined;
  };

  const handleRemoteAppClick = (app: RemoteApp) => {
    openTab('custom', { url: app.url, label: app.name });
    navigate(`/agents/custom?url=${encodeURIComponent(app.url)}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = installedSlugs.indexOf(active.id as string);
    const newIndex = installedSlugs.indexOf(over.id as string);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorder(oldIndex, newIndex);
    }
  };

  // Group built-in agents by category
  const builtInByCategory = new Map<string, AgentConfig[]>();
  for (const agent of agents) {
    const cat = agent.category;
    if (!builtInByCategory.has(cat)) builtInByCategory.set(cat, []);
    builtInByCategory.get(cat)!.push(agent);
  }

  return (
    <div data-tutorial="desktop-shortcuts" className="absolute inset-0 overflow-auto flex flex-col">
      <div className="relative flex-1 px-6 pt-6 sm:px-10 sm:pt-8 pb-8 space-y-6">

        {/* 1. Featured Projects carousel */}
        {featuredProjects && featuredProjects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-[rgba(255,255,255,0.3)]">
                Featured Projects
              </h2>
              <Link to="/explore" className="text-[11px] font-medium text-orange-500 dark:text-brand-orange hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <DragScroll>
              {featuredProjects.map((project) => (
                <div key={project.slug} className="shrink-0">
                  <FeaturedProjectCard project={project} metrics={metricsByProject[project._id]} />
                </div>
              ))}
            </DragScroll>
          </section>
        )}

        {/* 2. Installed + Built-in apps together in one draggable section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-[rgba(255,255,255,0.3)] mb-3 px-1">
            {installedProjects.length > 0 ? 'Apps' : 'System'}
          </h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={installedSlugs}
              strategy={rectSortingStrategy}
            >
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {/* Installed projects — draggable */}
                {installedProjects.map((project) => (
                  <SortableProjectIcon key={project.slug} project={project} />
                ))}
                {/* Built-in agents — static */}
                {Array.from(builtInByCategory.values()).flat().map((agent) => (
                  <DesktopIcon
                    key={agent.id}
                    agent={agent}
                    isOpen={openAppIds.has(agent.id)}
                    badge={getBadge(agent.id)}
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* 4. Ecosystem — remote apps + non-installed marketplace projects */}
        {((remoteApps && remoteApps.length > 0) || ecosystemProjects.length > 0) && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-[rgba(255,255,255,0.3)] mb-3 px-1">
              Discover
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {remoteApps?.map((app) => (
                <EcosystemAppCard
                  key={app.url}
                  name={app.name}
                  subtitle={app.description}
                  iconUrl={app.icon}
                  onClick={() => handleRemoteAppClick(app)}
                />
              ))}
              {ecosystemProjects.map((project) => (
                <EcosystemAppCard
                  key={project.slug}
                  name={project.name}
                  subtitle={project.tagline}
                  iconUrl={project.logoUrl}
                  accentColor={project.accentColor}
                  onClick={() => navigate(`/apps/${project.slug}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <p className="text-center text-xs text-neutral-400 dark:text-[rgba(255,255,255,0.3)] pt-2 pb-4">
          <Link to="/explore" className="underline hover:text-neutral-600 dark:hover:text-[rgba(255,255,255,0.6)] transition-colors">
            Explore marketplace
          </Link>
          {' '}&middot;{' '}
          <a href="https://github.com/unicity-sphere/sphere-apps" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600 dark:hover:text-[rgba(255,255,255,0.6)] transition-colors">
            Submit your project
          </a>
        </p>
      </div>
    </div>
  );
}
