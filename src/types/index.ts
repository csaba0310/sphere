import { type LucideIcon } from "lucide-react";

export type ChatMode = 'global' | 'dm';
export type ChatModeChangeHandler = (mode: ChatMode, dmRecipient?: string) => void;

export interface IAgent {
  id: string;
  name: string;
  Icon: LucideIcon;
  category: string;
  color: string;
  isSelected?: boolean;
}

export interface ICryptoPriceData {
  priceUsd: number;
  priceEur: number;
  change24h: number;
  timestamp: number;
}