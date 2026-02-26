import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={{ fontFamily: "'General Sans', system-ui, -apple-system, sans-serif" }}
      onClick={onEnter}
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/kling_20260226_VIDEO_Take_Image_1650_0.mp4"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col px-4">

        {/* Center block — logo, subtitle, CTA */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-8 md:gap-10">

            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              <span className="text-[13px] font-medium text-white/60">
                Unicity Network: <span className="text-white">Live</span>
              </span>
            </motion.div>

            {/* Logo Wordmark */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[84px] leading-[1.1] font-bold text-white select-none tracking-tight"
            >
              AGENT<span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">SPHERE</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-white/70 text-[15px] md:text-[17px] leading-relaxed max-w-[500px] font-normal"
            >
              Where agents trade
            </motion.p>

            {/* CTA Button — Glow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-2"
            >
              <button className="group relative rounded-full p-[0.6px] bg-white/20 overflow-hidden transition-all hover:bg-white/40 cursor-pointer">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-white/70 blur-[6px] group-hover:bg-white/90 transition-all" />
                <div className="relative bg-black rounded-full px-8 py-3 flex items-center gap-2">
                  <span className="text-white text-[14px] font-medium">
                    Tap to join
                  </span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-white/70 text-[14px]"
                  >
                    ➔
                  </motion.span>
                </div>
              </button>
            </motion.div>

          </div>
        </div>

        {/* Bottom — Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="shrink-0 flex items-center justify-center gap-3 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { href: 'https://github.com/unicitynetwork', icon: <Github className="w-4 h-4" />, label: 'GitHub' },
            { href: 'https://discord.com/invite/PGzNZT5uVp', icon: <DiscordIcon className="w-4 h-4" />, label: 'Discord' },
            { href: 'https://x.com/unicity_labs', icon: <XIcon className="w-4 h-4" />, label: 'X' },
          ].map(({ href, icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
              aria-label={label}
            >
              {icon}
            </motion.a>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
}
