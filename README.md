# Unicity AgentSphere

A Web3 wallet and agent platform for the Unicity network — dual-layer crypto wallet, DMs, group chat, and marketplace.

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

### Connect Protocol (dApp ↔ Wallet)

Sphere implements `ConnectHost` — the wallet side of the Sphere Connect protocol. External dApps can connect to Sphere and request wallet operations:

- **Iframe mode** — dApp embedded inside Sphere as an iframe connects via `PostMessageTransport`
- **Popup mode** — dApp opens Sphere as a popup window, user approves the connection
- **Permission-based access** — dApp requests specific scopes; user approves or rejects
- **Intent handling** — dApp triggers send/sign/DM flows in the wallet UI

Key components: `ConnectPage` (`/connect` route), `ConnectProvider`, `ConnectionApprovalModal`.

### Agent System

Agents are specialized interfaces loaded as tabs. Currently active:
- **Messages (DM)** — private conversations via Nostr
- **Group Chat** — public group channels via NIP-29
- **Sphere Agents** — load any external dApp via iframe (custom URL)

Additional agent types can be added in `src/config/activities.ts`.

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
VITE_MIXPANEL_TOKEN=             # Analytics (optional)
VITE_WELCOME_AGENT_NAMETAG=kbbot # Welcome DM agent nametag
VITE_WELCOME_DELAY_MS=4000       # Delay before welcome DM (ms)
SSL_CERT_PATH=                   # Dev server HTTPS (optional)
HMR_HOST=                        # Remote HMR host (optional)
BASE_PATH=/                      # Deployment base path
```

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
├── sdk/                 # React adapter layer over sphere-sdk (24 files)
│   ├── hooks/core/      # useSphere, useWalletStatus, useIdentity, useNametag, useSphereEvents, useIpfsSync
│   ├── hooks/payments/  # useTokens, useBalance, useAssets, useTransfer, useTransactionHistory
│   ├── hooks/l1/        # useL1Balance, useL1Utxos, useL1Send, useL1Transactions
│   ├── hooks/comms/     # useSendDM, usePaymentRequests
│   └── utils/           # format utilities
├── components/
│   ├── activity/        # Activity ticker, market feed display
│   ├── agents/          # Agent cards and selection
│   ├── chat/            # DM, group chat, mini chat, hooks
│   ├── wallet/          # L1, L3, onboarding, shared components
│   ├── layout/          # DashboardLayout, Header
│   ├── desktop/         # Desktop layout, TabBar, Taskbar
│   ├── connect/         # Wallet connection flow
│   └── ...              # splash, theme, tutorial, ui
├── pages/               # IntroPage, AgentPage, MarketsPage, + lazy-loaded pages
├── hooks/               # 9 app-level hooks
├── contexts/            # ServicesProvider (GroupChat)
├── services/            # FaucetService
├── config/              # activities, localStorage keys
├── lib/                 # TanStack Query client config
├── utils/               # markdown, mentions, retry
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
