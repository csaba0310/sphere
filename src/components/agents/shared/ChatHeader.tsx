import { useState, useRef, useEffect } from 'react';
import { Menu, PanelLeft, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { agents, type AgentConfig } from '../../../config/activities';

interface ChatHeaderProps {
  agent: AgentConfig;
  rightContent?: React.ReactNode;
  onToggleSidebar?: () => void;
  onExpandSidebar?: () => void;
  showMenuButton?: boolean;
  sidebarCollapsed?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function ChatHeader({
  agent,
  rightContent,
  onToggleSidebar,
  onExpandSidebar,
  showMenuButton,
  sidebarCollapsed,
  isFullscreen,
  onToggleFullscreen,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowAgentPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAgentSelect = (agentId: string) => {
    navigate(`/agents/${agentId}`);
    setShowAgentPicker(false);
  };

  return (
    <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-[rgba(255,255,255,0.06)] relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Desktop expand sidebar button (when collapsed) */}
          {showMenuButton && sidebarCollapsed && onExpandSidebar && (
            <motion.button
              onClick={onExpandSidebar}
              className="hidden lg:block p-1.5 rounded-lg text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </motion.button>
          )}
          {/* Mobile menu button */}
          {showMenuButton && onToggleSidebar && (
            <motion.button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-4 h-4" />
            </motion.button>
          )}

          {/* Mobile & Fullscreen: Agent picker dropdown */}
          <div ref={pickerRef} className={`relative ${isFullscreen ? '' : 'lg:hidden'}`}>
            <button
              onClick={() => setShowAgentPicker(!showAgentPicker)}
              className="flex items-center gap-2.5 active:scale-95 transition-transform"
            >
              <div className="p-1.5 rounded-xl bg-neutral-100 dark:bg-[rgba(255,255,255,0.06)]">
                <agent.Icon className="w-4 h-4 text-orange-500 dark:text-brand-orange" />
              </div>
              <div className="text-left">
                <div className="text-sm text-neutral-900 dark:text-white font-medium">{agent.name}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 dark:text-[rgba(255,255,255,0.35)] transition-transform ${showAgentPicker ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAgentPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#0a0a0a]/90 dark:backdrop-blur-xl border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl overflow-hidden"
                >
                  {agents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAgentSelect(a.id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors ${
                        a.id === agent.id ? 'bg-neutral-50 dark:bg-[rgba(255,255,255,0.04)]' : ''
                      }`}
                    >
                      <div className="p-1.5 rounded-xl bg-neutral-100 dark:bg-[rgba(255,255,255,0.06)] shrink-0">
                        <a.Icon className="w-4 h-4 text-orange-500 dark:text-brand-orange" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-neutral-900 dark:text-white text-sm font-medium">{a.name}</div>
                        <div className="text-neutral-400 dark:text-[rgba(255,255,255,0.35)] text-xs truncate">{a.description}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: Static agent info (hidden in fullscreen) */}
          <div className={`${isFullscreen ? 'hidden' : 'hidden lg:flex'} items-center gap-2.5`}>
            <div className="p-1.5 rounded-xl bg-neutral-100 dark:bg-[rgba(255,255,255,0.06)]">
              <agent.Icon className="w-4 h-4 text-orange-500 dark:text-brand-orange" />
            </div>
            <div>
              <h2 className="text-sm text-neutral-900 dark:text-white font-medium">{agent.name}</h2>
            </div>
          </div>
        </div>

        {/* Right side: fullscreen toggle + custom content */}
        <div className="flex items-center gap-1.5">
          {rightContent}
          {onToggleFullscreen && (
            <motion.button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
