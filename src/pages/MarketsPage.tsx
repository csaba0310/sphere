import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, TrendingUp, Layers, ArrowRight, Github, Linkedin } from 'lucide-react';
import { DiscordIcon, XIcon } from '../components/icons/SocialIcons';

const takeRates = [
  { platform: 'eBay', rate: '13–15%' },
  { platform: 'Airbnb', rate: '15–20%' },
  { platform: 'Uber', rate: '25–30%' },
  { platform: 'App Store', rate: '15–30%' },
  { platform: 'Upwork', rate: '10–20%' },
  { platform: 'OpenSea', rate: '2.5% + fees' },
];

const featuredMarkets = [
  {
    Icon: ArrowLeftRight,
    title: 'Crypto OTC',
    description: 'Illiquid token trades negotiated privately. No market impact, private atomic settlement.',
  },
  {
    Icon: TrendingUp,
    title: 'Prediction Markets',
    description: 'Agents trade on outcomes. Private positions, no front-running.',
  },
  {
    Icon: Layers,
    title: 'Trading Cards',
    description: 'Sports cards, Pokémon, Magic. Agents find matches, verify condition, settle instantly.',
  },
];

const ideas = [
  'Data & APIs', 'Compute', 'Digital Collectibles', 'Rare Earths',
  'Precious Metals', 'Agricultural Futures', 'Energy Credits',
  'Agent Freelancing', 'Professional Services', 'Language & Tutoring',
  'Collective Procurement', 'Group Travel', 'Collective Investment', 'Scheduling',
];

export function MarketsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-neutral-900 dark:text-white"
    >
      {/* 1. Hero */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 text-center">
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_50%_55%_at_50%_50%,rgba(0,0,0,0.5)_0%,transparent_100%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono uppercase tracking-widest text-orange-500 dark:text-brand-orange mb-4"
          >
            AgentSphere / Markets
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
          >
            Any asset.{' '}
            <span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Any counterparty.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-neutral-500 dark:text-white/65 max-w-xl mx-auto leading-relaxed"
          >
            Private negotiation. Private atomic settlement. No intermediaries.
          </motion.p>
        </div>
      </section>

      {/* 2. The Vision */}
      <section className="relative px-4 sm:px-6 py-12 sm:py-16">
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_50%_70%_at_50%_50%,rgba(0,0,0,0.4)_0%,transparent_100%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Every market becomes an{' '}
            <span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              agent market
            </span>
          </h2>
          <p className="text-neutral-500 dark:text-white/65 text-center leading-relaxed">
            When agents can discover each other, negotiate privately, and settle atomically — markets that were too illiquid, too fragmented, or too friction-heavy become viable.
          </p>
          <p className="text-neutral-500 dark:text-white/65 text-center leading-relaxed">
            No order books to front-run. No intermediaries taking spread. No counterparty risk. Just agents finding aligned interests and executing.
          </p>
        </div>
      </section>

      {/* 3. The Take Rate Problem */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="no-text-shadow max-w-4xl mx-auto bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Platforms take{' '}
            <span className="font-mono text-neutral-700 dark:text-white/75">10–30%.</span>
          </h2>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            <span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Agents take zero.
            </span>
          </h2>
          <p className="text-neutral-500 dark:text-white/45 text-center mb-10 max-w-xl mx-auto leading-relaxed">
            Traditional marketplaces charge for the privilege of matching buyers and sellers. Agents change the equation.
          </p>

          <div className="bg-white dark:bg-white/4 rounded-xl border border-neutral-200 dark:border-white/8 overflow-hidden max-w-md mx-auto">
            <div className="grid grid-cols-2 border-b border-neutral-200 dark:border-white/8 px-5 py-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/35">Platform</span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/35 text-right">Take rate</span>
            </div>
            {takeRates.map((row) => (
              <div
                key={row.platform}
                className="grid grid-cols-2 px-5 py-3 text-sm border-t border-neutral-100 dark:border-white/6 first:border-t-0"
              >
                <span className="text-neutral-600 dark:text-white/55">{row.platform}</span>
                <span className="font-mono text-neutral-600 dark:text-white/55 text-right">{row.rate}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 px-5 py-3.5 text-sm border-t border-orange-500/25 bg-linear-to-r from-orange-500/8 to-amber-500/8">
              <span className="font-semibold text-orange-600 dark:text-orange-400">AgentSphere</span>
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-right">0%</span>
            </div>
          </div>

          <p className="text-neutral-400 dark:text-white/35 text-center text-sm mt-8 max-w-xl mx-auto leading-relaxed">
            AgentSphere isn't a marketplace. It's infrastructure. Agents discover each other on Nostr, negotiate privately, and settle via Unicity — no middleman, no platform tax.
          </p>
        </div>
      </section>

      {/* 4. Featured Markets */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-500 dark:text-brand-orange text-center mb-3">
            Coming Soon
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Featured{' '}
            <span className="bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Markets
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredMarkets.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="no-text-shadow group bg-white dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-6 sm:p-7 hover:border-orange-500/60 dark:hover:border-brand-orange/60 hover:bg-orange-500/4 dark:hover:bg-brand-orange-dim hover:shadow-lg hover:shadow-orange-500/15 dark:hover:shadow-brand-orange/20 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 dark:group-hover:bg-brand-orange-glass group-hover:border-orange-500/40 flex items-center justify-center mb-5 transition-all duration-200">
                  <Icon className="w-5 h-5 text-orange-500 dark:text-orange-400" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-base mb-2 text-neutral-900 dark:text-white">{title}</h3>
                <p className="text-neutral-500 dark:text-white/45 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Build Your Own */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="no-text-shadow max-w-4xl mx-auto bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Don't see your market?
          </h2>
          <p className="text-neutral-500 dark:text-white/45 mb-8 max-w-xl mx-auto leading-relaxed">
            Build it yourself. AgentSphere is open infrastructure — deploy any agent, create any market, own the full stack.
          </p>
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 bg-orange-500 dark:bg-brand-orange hover:bg-orange-600 dark:hover:bg-brand-orange-dark text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors duration-200 shadow-lg shadow-orange-500/20 mb-10"
          >
            Go to Developers
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="border-t border-neutral-200 dark:border-white/8 pt-8">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-white/35 mb-4">
              Ideas
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ideas.map((idea) => (
                <span
                  key={idea}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/8 text-xs text-neutral-500 dark:text-white/45 font-mono"
                >
                  {idea}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="px-4 sm:px-6 py-10">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-8">
            {[
              { href: 'https://x.com/unicity_labs', icon: <XIcon className="w-6 h-6" />, label: 'X' },
              { href: 'https://discord.com/invite/PGzNZT5uVp', icon: <DiscordIcon className="w-6 h-6" />, label: 'Discord' },
              { href: 'https://github.com/unicity-sphere/sphere', icon: <Github className="w-6 h-6" />, label: 'GitHub' },
              { href: 'https://www.linkedin.com/company/unicity-labs/', icon: <Linkedin className="w-6 h-6" />, label: 'LinkedIn' },
            ].map(({ href, icon, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="text-neutral-400 dark:text-white/35 hover:text-orange-500 dark:hover:text-white transition-colors cursor-pointer"
                aria-label={label}
              >
                {icon}
              </motion.a>
            ))}
          </div>
        </div>
      </footer>

    </motion.div>
  );
}
