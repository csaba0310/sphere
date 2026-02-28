import { Github, Linkedin } from 'lucide-react';
import { DiscordIcon, XIcon } from '../icons/SocialIcons';

const socialLinks = [
  { href: 'https://x.com/unicity_labs', icon: XIcon, label: 'X' },
  { href: 'https://discord.com/invite/PGzNZT5uVp', icon: DiscordIcon, label: 'Discord' },
  { href: 'https://github.com/unicitynetwork', icon: Github, label: 'GitHub' },
  { href: 'https://www.linkedin.com/company/unicity-labs/', icon: Linkedin, label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="shrink-0 flex items-center justify-center gap-5 py-3">
      {socialLinks.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-neutral-400 dark:text-[rgba(255,255,255,0.35)] hover:text-orange-500 dark:hover:text-brand-orange transition-colors"
          aria-label={label}
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </footer>
  );
}
