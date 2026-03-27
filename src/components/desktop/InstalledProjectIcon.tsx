import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, Store, Trash2, MoreVertical } from 'lucide-react';
import { useDesktopState } from '../../hooks/useDesktopState';
import { useInstalledProjects } from '../../hooks/useInstalledProjects';
import type { ProjectSummary } from '../../services/marketplaceApi';

interface InstalledProjectIconProps {
  project: ProjectSummary & { appUrl?: string | null; websiteUrl?: string | null };
}

export function InstalledProjectIcon({ project }: InstalledProjectIconProps) {
  const navigate = useNavigate();
  const { openTab } = useDesktopState();
  const { uninstall } = useInstalledProjects();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  // Primary click: always open in iframe tab
  // Use appUrl if available, otherwise use websiteUrl as fallback
  const launchUrl = project.appUrl ?? project.websiteUrl;

  const handleClick = () => {
    if (launchUrl) {
      openTab('custom', { url: launchUrl, label: project.name });
      navigate(`/agents/custom?url=${encodeURIComponent(launchUrl)}`);
    } else {
      // Last resort: open marketplace page
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

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.05 }}
        className="flex flex-col items-center gap-2 p-3 rounded-2xl group cursor-pointer relative"
      >
        {/* Icon */}
        <div className="relative">
          {/* Glow */}
          <div
            className="absolute -inset-1 blur-xl opacity-0 group-hover:opacity-50 transition-all duration-300 rounded-2xl"
            style={{ backgroundColor: project.accentColor }}
          />

          <div
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}cc)` }}
          >
            {/* Mesh overlay */}
            <div
              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
              style={{
                backgroundImage: `radial-gradient(at 27% 37%, rgba(255,255,255,0.15) 0px, transparent 50%),
                                 radial-gradient(at 97% 21%, rgba(255,255,255,0.1) 0px, transparent 50%)`,
              }}
            />
            <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full group-hover:w-10 group-hover:h-10 transition-all duration-300" />

            {!imgError ? (
              <img
                src={project.logoUrl}
                alt={project.name}
                onError={() => setImgError(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg relative z-10 drop-shadow-lg"
              />
            ) : (
              <span className="text-white font-bold text-lg relative z-10">{project.name[0]}</span>
            )}
          </div>

          {/* Context menu button */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>

        {/* Label */}
        <span className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-[rgba(255,255,255,0.45)] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors truncate max-w-20 sm:max-w-24 text-center leading-tight">
          {project.name}
        </span>
      </motion.button>

      {/* Context menu */}
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
