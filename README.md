# Unicity AgentSphere

A Web3 wallet and agent platform for the Unicity network — dual-layer crypto wallet, AI agents, DMs, group chat, and marketplace.

## Features

### Multi-Layer Wallet

**Layer 1 (ALPHA blockchain):**
- Wallet creation, import, and management
- Transaction history and vesting
- Password protection
- L1-L3 bridge

**Layer 3 (Unicity state transitions):**
- Fast, low-cost token transfers
- Token management and balance tracking
- Incoming payment notifications
- Nametag system (@username)

**Common:** QR codes, wallet switching, seed phrase management, real-time market data.

### Agent System

Agents are specialized interfaces loaded as tabs. Currently active:
- **Messages (DM)** — private conversations via Nostr
- **Group Chat** — public group channels via NIP-29
- **Sphere Agents** — load any external dApp via iframe (custom URL)

The architecture supports additional agent types (AI, trivia, games, merch, etc.) which can be enabled in `src/config/activities.ts`.

### Group Chat (NIP-29)

Relay-based group messaging via [NIP-29](https://github.com/nostr-protocol/nips/blob/master/29.md):
- Public and private groups with invite codes
- Real-time messaging via WebSocket
- Group discovery, join/leave, unread tracking
- Dedicated Zooid relay at `wss://sphere-relay.unicity.network`

## Quick Start

### Requirements
- Node.js 20+

### Setup

```bash
npm install
cp .env.example .env    # Configure environment variables
npm run dev              # Start dev server at http://localhost:5173
```

### Commands

```bash
npm run dev          # Development server
npm run build        # TypeScript compile + Vite production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
```

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

```env
VITE_AGENT_API_URL=http://localhost:3000   # Agent chatbot backend
VITE_USE_MOCK_AGENTS=true                   # Mock agents for local dev
VITE_AGGREGATOR_URL=/rpc                    # L3 aggregator (proxied in dev)
VITE_NOSTR_RELAYS=wss://...                 # DM relays (comma-separated)
VITE_GROUP_CHAT_RELAYS=wss://...            # NIP-29 group chat relays
BASE_PATH=/                                 # Deployment base path
```

See `.env.example` for the full list including IPFS, analytics, SSL, and HMR options.

## Tech Stack

- **React 19** + TypeScript, **Vite 7**
- **TanStack Query v5** — server state
- **Tailwind CSS 4** — styling
- **Framer Motion** — animations
- **React Router DOM v7** — routing
- **@unicitylabs/sphere-sdk** — all wallet operations (L1, L3, Nostr, IPFS)
- **Vitest** + jsdom — testing

## Project Structure

```
src/
├── index.html           # HTML entry point
├── main.tsx             # App bootstrap, provider tree
├── App.tsx              # Route definitions
├── sdk/                 # React adapter layer over sphere-sdk (21 files)
│   ├── core/            # useSphere, useWalletStatus, useIdentity, useSphereEvents
│   ├── payments/        # useTokens, useBalance, useTransfer, useTransactionHistory
│   ├── l1/              # useL1Balance, useL1Utxos, useL1Send, useL1Transactions
│   └── comms/           # useSendDM, usePaymentRequests
├── components/
│   ├── agents/          # Agent cards, AgentChat, MerchChat, TriviaChat, GamesChat
│   ├── chat/            # DM, group chat, mini chat, hooks, utils
│   ├── wallet/          # L1, L3, onboarding, shared, UI components
│   ├── layout/          # DashboardLayout, Header, IpfsSyncIndicator
│   ├── desktop/         # Desktop layout, TabBar, Taskbar
│   ├── connect/         # Wallet connection flow
│   └── ...              # splash, theme, tutorial, ui
├── pages/               # IntroPage, AgentPage, ConnectPage, + lazy-loaded pages
├── hooks/               # 12 app-level hooks
├── contexts/            # ServicesProvider (GroupChat)
├── services/            # ActivityService, FaucetService
├── config/              # localStorage key constants
├── utils/               # markdown, memory, mentions, retry
└── types/               # TypeScript type definitions
tests/
└── unit/                # Vitest tests (jsdom)
```

## Docker

```bash
docker compose up        # Runs on port 3010
```

## License

Private project — Unicity Labs
