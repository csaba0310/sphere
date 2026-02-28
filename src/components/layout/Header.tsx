import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../theme';
import { STORAGE_KEYS } from '../../config/storageKeys';
import { IpfsSyncIndicator } from './IpfsSyncIndicator';
import { useDesktopState } from '../../hooks/useDesktopState';

function devReset(): void {
  localStorage.removeItem(STORAGE_KEYS.DEV_AGGREGATOR_URL);
  localStorage.removeItem(STORAGE_KEYS.DEV_SKIP_TRUST_BASE);
  window.dispatchEvent(new Event("dev-config-changed"));
}
import logoUrl from '/Union.svg';

const navItems: { label: string; path: string; external?: boolean }[] = [
  { label: 'Home', path: '/home' },
  { label: 'Markets', path: '/markets' },
  { label: 'Devs', path: '/developers' },
  { label: 'Agents', path: '/explore-agents' },
  { label: 'About', path: '/about' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showDesktop } = useDesktopState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDevConfig = () => ({
    aggregatorUrl: localStorage.getItem(STORAGE_KEYS.DEV_AGGREGATOR_URL),
    skipTrustBase: localStorage.getItem(STORAGE_KEYS.DEV_SKIP_TRUST_BASE) === 'true',
  });
  const [devConfig, setDevConfig] = useState(getDevConfig);

  useEffect(() => {
    const handler = () => setDevConfig(getDevConfig());
    window.addEventListener('dev-config-changed', handler);
    return () => window.removeEventListener('dev-config-changed', handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getHostname = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.length > 20 ? hostname.slice(0, 20) + '...' : hostname;
    } catch {
      return url.slice(0, 20);
    }
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (!path) return false;
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname.startsWith('/agents/');
    }
    if (path === '/developers') {
      return location.pathname.startsWith('/developers');
    }
    return location.pathname === path;
  };

  return (
    <>
    <header data-tutorial="header" className="sticky top-0 z-50 w-full shrink-0">
      <div className="px-12 sm:px-20 lg:px-28 pt-3 pb-5 lg:pb-7">
        <div className="flex items-end">
          {/* Logo — translate down so its center aligns with the line (like splash screen) */}
          <button
            onClick={() => { showDesktop(); navigate('/home'); }}
            className="shrink-0 pr-2 sm:pr-3 group cursor-pointer translate-y-1/2 relative z-10"
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 transition-transform duration-200 group-hover:scale-110 dark:brightness-0 dark:invert"
            />
          </button>

          {/* Right side: nav above the line, line at the bottom */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-end pb-1.5">
              <nav className="hidden lg:flex items-center gap-12 xl:gap-14 ml-8 xl:ml-12" style={{ fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace" }}>
                {navItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-medium transition-colors duration-200 text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-neutral-700 dark:hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`text-[15px] font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-neutral-700 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </nav>

              <div className="flex-1" />

              {(devConfig.aggregatorUrl || devConfig.skipTrustBase) && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[10px] sm:text-xs font-mono mr-3">
                  <span className="text-orange-500 font-semibold">DEV</span>
                  <span className="text-orange-400/80 hidden sm:inline">
                    {devConfig.aggregatorUrl && (
                      <span title={devConfig.aggregatorUrl}>
                        {getHostname(devConfig.aggregatorUrl)}
                      </span>
                    )}
                    {devConfig.aggregatorUrl && devConfig.skipTrustBase && " | "}
                    {devConfig.skipTrustBase && "TB:OFF"}
                  </span>
                  <button
                    onClick={devReset}
                    className="ml-1 px-1.5 py-0.5 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 font-semibold transition-colors"
                    title="Reset dev settings to production defaults"
                  >
                    RESET
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 lg:gap-3">
                <IpfsSyncIndicator />
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-brand-orange-dim rounded-lg transition-all"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  ) : (
                    <Menu className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Line — at the bottom of this column, aligned with logo center via translate */}
            <div className="h-0.5 bg-neutral-300 dark:bg-[#fefefe] rounded-[10px]" />
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 top-[60px] bg-black/20 backdrop-blur-sm z-60"
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:hidden fixed left-0 right-0 top-[60px] backdrop-blur-xl border-b z-60 shadow-xl overflow-hidden bg-white/95 dark:bg-[#060606]/80 border-neutral-200 dark:border-[rgba(255,111,0,0.12)]"
          >
          <nav className="px-4 py-3 space-y-1" style={{ fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace" }}>
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all text-neutral-600 dark:text-[rgba(255,255,255,0.45)] hover:bg-neutral-100 dark:hover:bg-brand-orange-dim"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleMobileNavigation(item.path)}
                  className={`relative w-full flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all text-left ${
                    isActive(item.path)
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-[rgba(255,255,255,0.45)] hover:bg-neutral-100 dark:hover:bg-brand-orange-dim'
                  }`}
                >
                  {isActive(item.path) && (
                    <motion.span
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-orange-500 dark:bg-brand-orange origin-center rounded-full"
                    />
                  )}
                  {item.label}
                </button>
              )
            ))}
          </nav>
        </motion.div>
        </>
      )}
    </AnimatePresence>

    </>
  );
}
