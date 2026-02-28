import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import { DiscordIcon, XIcon } from '../icons/SocialIcons';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isExploreHovered, setIsExploreHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-[#060606] overflow-hidden"
    >
      {/* ── Video Background (sphere) ── */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/kling_20260226_VIDEO_Take_Image_1650_0.mp4"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ── Content layer ── */}
      <div className="relative z-20 h-full flex flex-col">

        {/* ── Top: UNICITY logo + decorative line ── */}
        <div className="flex items-center px-6 sm:px-10 lg:px-[23%] pt-5 sm:pt-7 lg:pt-14">
          <motion.img
            src="/UnicityLogo.svg"
            alt="Unicity"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-[18px] sm:h-[22px] lg:h-[26px] w-auto shrink-0 select-none"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            className="h-0.5 bg-[#fefefe] rounded-[10px] ml-2 sm:ml-3 origin-left"
            style={{ flex: '1 1 0', maxWidth: '750px' }}
          />
        </div>

        {/* ── Center: title / tagline / button ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-6 sm:mt-4 lg:mt-2">
          <div className="flex flex-col items-center">

            {/* AGENTSPHERE — Anton font */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-[#fefefe] text-[60px] sm:text-[68px] md:text-[80px] lg:text-[96px] xl:text-[110px] font-normal leading-none select-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                AGENT
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                SPHERE
              </motion.span>
            </motion.h1>

            {/* Tagline — orange-tinted glass pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-1 sm:mt-1.5 flex items-center justify-center"
            >
              <div
                className="px-12 sm:px-14 py-1.5 sm:py-2 rounded-full backdrop-blur-[5px]"
                style={{ background: 'rgba(255, 111, 0, 0.15)' }}
              >
                <p
                  className="text-[#ffe2cc] text-xs sm:text-sm md:text-base lg:text-lg font-normal whitespace-nowrap"
                  style={{ fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace" }}
                >
                  Where agents trade
                </p>
              </div>
            </motion.div>

            {/* Explore button — flat top, rounded bottom, fill animation on hover */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsExploreHovered(true)}
              onHoverEnd={() => setIsExploreHovered(false)}
              onClick={onEnter}
              className="mt-2 sm:mt-3 w-40 sm:w-[190px] lg:w-[210px] h-[38px] sm:h-[42px] lg:h-[46px] cursor-pointer shadow-lg hover:shadow-xl relative overflow-hidden"
              style={{
                borderRadius: '5px 5px 50px 50px',
                fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
                background: 'white',
              }}
            >
              {/* Orange fill layer — animates from bottom */}
              <motion.div
                className="absolute inset-0"
                initial={{ y: '100%' }}
                animate={{ y: isExploreHovered ? '0%' : '100%' }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background: '#FF6F00',
                  borderRadius: 'inherit',
                }}
              />
              <motion.span
                animate={{
                  color: isExploreHovered ? '#ffffff' : '#1d0900',
                }}
                transition={{ duration: 0.25 }}
                className="relative z-10 text-sm sm:text-base lg:text-lg font-medium"
              >
                Explore
              </motion.span>
            </motion.button>

          </div>
        </div>

        {/* ── Bottom: Social icons ── */}
        <div className="shrink-0 flex items-center justify-center gap-6 sm:gap-8 pb-6 sm:pb-8 lg:pb-[60px]">
          {[
            { href: 'https://x.com/unicity_labs', icon: <XIcon className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]" />, label: 'X' },
            { href: 'https://discord.com/invite/PGzNZT5uVp', icon: <DiscordIcon className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]" />, label: 'Discord' },
            { href: 'https://github.com/unicity-sphere/sphere', icon: <Github className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]" />, label: 'GitHub' },
            { href: 'https://www.linkedin.com/company/unicity-labs/', icon: <Linkedin className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]" />, label: 'LinkedIn' },
          ].map(({ href, icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="text-[#e7e7e7] hover:text-white transition-colors cursor-pointer"
              aria-label={label}
            >
              {icon}
            </motion.a>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
