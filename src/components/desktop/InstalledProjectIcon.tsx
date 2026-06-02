import { useState, useRef, useEffect, type CSSProperties, type Ref } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, Store, Trash2 } from 'lucide-react';
import { InstalledProjectIcon as InstalledProjectIconUI } from '@unicitylabs/sphere-ui';
import { useDesktopState } from '../../hooks/useDesktopState';
import { useInstalledProjects } from '../../hooks/useInstalledProjects';
import type { ProjectSummary } from '../../services/marketplaceApi';

interface InstalledProjectIconProps {
  project: ProjectSummary & { appUrl?: string | null; websiteUrl?: string | null };
  /** Outer container ref (e.g. dnd-kit `setNodeRef`). */
  containerRef?: Ref<HTMLDivElement>;
  /** Outer container inline style (e.g. dnd-kit transform/transition). */
  containerStyle?: CSSProperties;
  /** Inner button ref (e.g. dnd-kit `setActivatorNodeRef`). */
  buttonRef?: Ref<HTMLButtonElement>;
  /** Extra props spread on the inner button (e.g. dnd-kit attributes+listeners). */
  buttonProps?: { className?: string; style?: CSSProperties } & Record<string, unknown>;
}

export function InstalledProjectIcon({
  project,
  containerRef,
  containerStyle,
  buttonRef,
  buttonProps,
}: InstalledProjectIconProps) {
  const navigate = useNavigate();
  const { openTab } = useDesktopState();
  const { uninstall, ping } = useInstalledProjects();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const launchUrl = project.appUrl ?? project.websiteUrl;

  const handleClick = () => {
    void ping(project.slug);
    if (launchUrl) {
      openTab('custom', { url: launchUrl, label: project.name });
      navigate(`/agents/custom?url=${encodeURIComponent(launchUrl)}`);
    } else {
      navigate(`/apps/${project.slug}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const menuItems = [
    ...(project.appUrl
      ? [{
          label: 'Open in Tab',
          icon: Globe,
          onClick: () => {
            openTab('custom', { url: project.appUrl!, label: project.name });
            navigate(`/agents/custom?url=${encodeURIComponent(project.appUrl!)}`);
          },
        }]
      : []),
    ...(project.websiteUrl
      ? [{
          label: 'Open Website',
          icon: ExternalLink,
          onClick: () => window.open(project.websiteUrl!, '_blank'),
        }]
      : []),
    {
      label: 'Marketplace Page',
      icon: Store,
      onClick: () => navigate(`/apps/${project.slug}`),
    },
    {
      label: 'Remove from Desktop',
      icon: Trash2,
      onClick: () => uninstall(project.slug),
      danger: true,
    },
  ];

  // Combine the outer wrapper ref (for menu outside-click) with the dnd-kit container ref
  const setContainerRef = (node: HTMLDivElement | null) => {
    (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof containerRef === 'function') containerRef(node);
    else if (containerRef && 'current' in containerRef) {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div className="relative" ref={setContainerRef} style={containerStyle}>
      <InstalledProjectIconUI
        name={project.name}
        logoUrl={project.logoUrl}
        accentColor={project.accentColor}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        buttonRef={buttonRef}
        buttonProps={buttonProps}
      />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {menuItems.map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left ${
                  danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
