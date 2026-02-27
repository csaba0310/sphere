import { MessageCircle, Hash, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Agent types for different UI layouts
export type AgentType = 'chat' | 'iframe';

// Quick action configuration
export interface QuickAction {
  label: string;
  message: string;
}

// Agent configuration
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  category: string;
  color: string;
  type: AgentType;
  greetingMessage?: string;
  placeholder?: string;
  backendActivityId?: string;
  quickActions?: QuickAction[];
  hasSidebar?: boolean;
  requiresWallet?: boolean;
  iframeUrl?: string;
  iframeUrls?: { label: string; url: string }[];
}

// All agents configuration
const allAgents: AgentConfig[] = [
  {
    id: 'dm',
    name: 'Messages',
    description: 'Private conversations',
    Icon: MessageCircle,
    category: 'Social',
    color: 'from-blue-500 to-cyan-500',
    type: 'chat',
    requiresWallet: true,
  },
  {
    id: 'group-chat',
    name: 'Group Chat',
    description: 'Public group channels',
    Icon: Hash,
    category: 'Social',
    color: 'from-indigo-500 to-purple-500',
    type: 'chat',
    requiresWallet: true,
  },
  {
    id: 'custom',
    name: 'Sphere Agents',
    description: 'Load any URL (e.g. localhost)',
    Icon: Globe,
    category: 'Custom',
    color: 'from-indigo-500 to-violet-600',
    type: 'iframe',
  },
];

export const agents: AgentConfig[] = allAgents;

// Get agent by ID
export function getAgentConfig(agentId: string): AgentConfig | undefined {
  return agents.find((a) => a.id === agentId);
}

// Check if an agent requires a wallet to function
export function agentRequiresWallet(agentId: string): boolean {
  const agent = getAgentConfig(agentId);
  return agent?.requiresWallet ?? false;
}
