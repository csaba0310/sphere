import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Star, Users, Zap, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import type { AstridSkill } from '../components/marketplace/SkillCard';

// Mock skills data (same as ExplorePage)
const MOCK_SKILLS: AstridSkill[] = [
  { id: 'wallet-helper', name: 'Wallet Helper', description: 'Check balances, view transaction history, and send tokens through natural conversation. Ask about your portfolio, recent transfers, or initiate payments — all in plain language.', icon: '💰', author: 'Unicity', category: 'utility', installs: 8430, rating: 4.9, price: 'Free', featured: true },
  { id: 'defi-analyzer', name: 'DeFi Analyzer', description: 'Analyze DeFi protocols, track yields, and compare liquidity pools across chains. Get real-time APY comparisons, impermanent loss calculations, and protocol risk assessments.', icon: '📊', author: 'CryptoLabs', category: 'defi', installs: 3210, rating: 4.7, price: '$0.01/use', featured: true },
  { id: 'quest-guide', name: 'Quest Guide', description: 'Get personalized quest recommendations and track your progress across all projects. Astrid suggests the best quests based on your activity, completed chains, and available rewards.', icon: '🎯', author: 'Unicity', category: 'utility', installs: 5120, rating: 4.8, price: 'Free', featured: true },
  { id: 'nft-scout', name: 'NFT Scout', description: 'Discover trending NFT collections, analyze floor prices, and track whale wallets. Get alerts on new mints, price movements, and rare trait listings across marketplaces.', icon: '🎨', author: 'NFTHunter', category: 'nft', installs: 1890, rating: 4.3, price: '$2.99/mo', featured: false },
  { id: 'trading-signals', name: 'Trading Signals', description: 'Real-time trading signals based on technical analysis and on-chain data. Receive buy/sell alerts, support/resistance levels, and volume analysis for any token.', icon: '📈', author: 'AlgoTrader', category: 'trading', installs: 4521, rating: 4.6, price: '$4.99/mo', featured: false },
  { id: 'web-search', name: 'Web Search', description: 'Search the internet and get summarized answers with source citations. Ask any question and Astrid will find, read, and synthesize information from across the web.', icon: '🔍', author: 'Unicity', category: 'utility', installs: 6780, rating: 4.5, price: 'Free', featured: false },
  { id: 'social-nostr', name: 'Nostr Social', description: 'Send DMs, read channels, and manage your Nostr social connections hands-free. Dictate messages, get conversation summaries, and discover relevant communities.', icon: '💬', author: 'Unicity', category: 'social', installs: 2340, rating: 4.4, price: 'Free', featured: false },
  { id: 'code-reviewer', name: 'Code Reviewer', description: 'Review smart contracts and dApp code for security vulnerabilities and best practices. Get detailed audit reports with severity ratings and fix suggestions.', icon: '🔐', author: 'SecureChain', category: 'developer', installs: 890, rating: 4.2, price: '$0.05/review', featured: false },
];

const categoryColors: Record<string, string> = {
  utility: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  defi: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  nft: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  trading: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  social: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  developer: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
};

export function SkillDetailPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const skill = MOCK_SKILLS.find(s => s.id === skillId);
  const [installed, setInstalled] = useState(false);

  if (!skill) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 dark:text-white/35">Skill not found</p>
        <Link to="/explore" className="text-orange-500 dark:text-brand-orange text-sm mt-2 inline-block hover:underline">Back to Explore</Link>
      </div>
    );
  }

  // Mock related skills
  const related = MOCK_SKILLS.filter(s => s.id !== skill.id && s.category === skill.category).slice(0, 3);
  if (related.length === 0) {
    related.push(...MOCK_SKILLS.filter(s => s.id !== skill.id).slice(0, 3));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neutral-900 dark:text-white pb-12">
      {/* Back */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 dark:text-white/35 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>

      {/* Header card */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="no-text-shadow max-w-5xl mx-auto bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/8 flex items-center justify-center text-4xl shrink-0">
              {skill.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{skill.name}</h1>
              <p className="text-sm text-neutral-500 dark:text-white/45 mt-1">by {skill.author}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${categoryColors[skill.category] ?? 'bg-neutral-500/15 text-neutral-400 border-neutral-500/25'}`}>
                  {skill.category}
                </span>
                <div className="flex items-center gap-1 text-sm text-amber-400">
                  <Star className="w-4 h-4" fill="currentColor" />
                  {skill.rating}
                </div>
                <span className="text-xs text-neutral-400 dark:text-white/35">{skill.installs.toLocaleString()} installs</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => setInstalled(!installed)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  installed
                    ? 'bg-green-500/15 text-green-500 border border-green-500/25'
                    : 'bg-orange-500 dark:bg-brand-orange hover:bg-orange-600 dark:hover:bg-brand-orange-dark text-white shadow-lg shadow-orange-500/20'
                }`}
              >
                {installed ? <><Check className="w-4 h-4" /> Installed</> : <><Download className="w-4 h-4" /> Install</>}
              </button>
              <span className="text-sm font-semibold text-neutral-600 dark:text-white/55">{skill.price}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-6 pt-5 border-t border-neutral-200 dark:border-white/8">
            {[
              { icon: Download, label: 'Installs', value: skill.installs.toLocaleString() },
              { icon: Star, label: 'Rating', value: `${skill.rating} / 5` },
              { icon: Users, label: 'Active Users', value: Math.round(skill.installs * 0.6).toLocaleString() },
              { icon: Zap, label: 'Avg Uses/Day', value: Math.round(skill.installs * 0.1).toLocaleString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-neutral-400 dark:text-white/30" />
                  <span className="text-lg font-bold font-mono">{value}</span>
                </div>
                <span className="text-xs text-neutral-400 dark:text-white/35 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="no-text-shadow bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-2xl border border-neutral-200 dark:border-white/8 p-6">
            <p className="text-neutral-600 dark:text-white/55 text-sm leading-relaxed">{skill.description}</p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getCapabilities(skill.id).map((cap, i) => (
              <div key={i} className="no-text-shadow bg-neutral-50 dark:bg-white/4 rounded-xl border border-neutral-200 dark:border-white/8 p-4">
                <div className="text-lg mb-2">{cap.icon}</div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">{cap.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-white/40">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example conversations */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Try asking Astrid</h2>
          <div className="flex flex-wrap gap-2">
            {getExamples(skill.id).map((example, i) => (
              <div key={i} className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/4 border border-neutral-200 dark:border-white/8 text-sm text-neutral-600 dark:text-white/55 italic">
                &ldquo;{example}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer info */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Developer</h2>
          <div className="no-text-shadow bg-neutral-50 dark:bg-white/4 dark:backdrop-blur-2xl rounded-xl border border-neutral-200 dark:border-white/8 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-sm font-bold text-orange-400">
              {skill.author[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{skill.author}</p>
              <p className="text-xs text-neutral-400 dark:text-white/35">Verified developer</p>
            </div>
            <a href="#" className="ml-auto text-xs text-orange-500 dark:text-brand-orange hover:underline flex items-center gap-1">
              View profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Related skills */}
      {related.length > 0 && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Related Skills</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map(s => (
                <Link key={s.id} to={`/skills/${s.id}`}>
                  <div className="no-text-shadow bg-neutral-50 dark:bg-white/4 rounded-xl border border-neutral-200 dark:border-white/8 p-4 hover:border-orange-500/40 dark:hover:border-brand-orange/40 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-neutral-400 dark:text-white/35">{s.author}</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-white/40 line-clamp-2">{s.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}

// Mock capabilities per skill
function getCapabilities(skillId: string) {
  const caps: Record<string, { icon: string; title: string; description: string }[]> = {
    'wallet-helper': [
      { icon: '💳', title: 'Balance Check', description: 'Instantly check your token balances across all chains' },
      { icon: '📜', title: 'Transaction History', description: 'Browse and search your recent transactions' },
      { icon: '💸', title: 'Send Tokens', description: 'Initiate transfers with natural language commands' },
    ],
    'defi-analyzer': [
      { icon: '📊', title: 'Yield Comparison', description: 'Compare APYs across protocols in real-time' },
      { icon: '⚠️', title: 'Risk Assessment', description: 'Evaluate protocol risk factors and audit status' },
      { icon: '💧', title: 'Liquidity Analysis', description: 'Track pool depth and impermanent loss' },
    ],
    'quest-guide': [
      { icon: '🎯', title: 'Recommendations', description: 'Personalized quest suggestions based on your activity' },
      { icon: '📈', title: 'Progress Tracking', description: 'See completion status across all projects' },
      { icon: '🏆', title: 'Reward Optimization', description: 'Maximize XP and project points earnings' },
    ],
  };
  return caps[skillId] ?? [
    { icon: '⚡', title: 'AI-Powered', description: 'Uses advanced language models for intelligent responses' },
    { icon: '🔒', title: 'Secure', description: 'Runs in sandboxed environment with permission controls' },
    { icon: '🔄', title: 'Always Updated', description: 'Skill data refreshes automatically' },
  ];
}

// Mock example prompts per skill
function getExamples(skillId: string) {
  const examples: Record<string, string[]> = {
    'wallet-helper': ['What is my current balance?', 'Show my last 10 transactions', 'Send 50 tokens to @alice'],
    'defi-analyzer': ['Compare yields on SphereSwap vs AlphaDEX', 'What are the safest DeFi protocols?', 'Calculate my impermanent loss'],
    'quest-guide': ['What quests should I do next?', 'How many quests have I completed in Boxiran?', 'What gives the most XP right now?'],
    'nft-scout': ['Show trending NFT collections', 'What is the floor price of CryptoPunks?', 'Track whale wallet 0x1234...'],
    'trading-signals': ['Give me a buy/sell signal for BTC', 'What are the support levels for ETH?', 'Show volume analysis for SOL'],
    'web-search': ['Search for latest Unicity news', 'What is the Agentic Internet?', 'Explain proof-of-history consensus'],
    'social-nostr': ['Send a DM to @bob saying hello', 'Summarize my unread messages', 'Join the Sphere community channel'],
    'code-reviewer': ['Audit this smart contract for vulnerabilities', 'Review my Solidity code', 'Check for reentrancy attacks'],
  };
  return examples[skillId] ?? ['Help me with this task', 'What can you do?', 'Show me examples'];
}
