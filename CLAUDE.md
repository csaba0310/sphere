# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unicity AgentSphere is a React-based cryptocurrency wallet application for the Unicity network. It provides a dual-layer wallet interface supporting both Layer 1 (ALPHA blockchain) and Layer 3 (Unicity state transition network) operations, along with agent-based chat, DMs, group chat, and a marketplace. All wallet operations are handled through `@unicitylabs/sphere-sdk`, with a thin React adapter layer in `src/sdk/`.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run preview      # Preview production build
npx tsc --noEmit     # Type check only
```

## Architecture

### Tech Stack
- React 19 + TypeScript ~5.9 with Vite 7
- TanStack Query v5 for server state management
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- Framer Motion for animations
- React Router DOM v7 for routing
- Vitest 4 + jsdom for testing
- `@unicitylabs/sphere-sdk` ^0.5 for all wallet operations (L1, L3, Nostr, IPFS)
- Lucide React for icons
- KaTeX for math rendering
- Mixpanel for analytics

### Routes (App.tsx)

```
/                    — IntroPage (splash screen)
/connect             — ConnectPage (wallet connection)
/home                — Redirects to /agents/dm
/agents/chat         — Redirects to /agents/dm
/agents/:agentId     — AgentPage (dm, ai, trivia, games, sport, p2p, merch, etc.)
/ai                  — Redirects to /agents/ai
/developers          — DevelopersPage (lazy)
/developers/docs     — DocsPage (lazy)
/mine                — MineAlphaPage (lazy)
/markets             — MarketsPage (lazy)
/explore-agents      — AgentsPage (lazy)
/about               — AboutPage (lazy)
```

All routes except `/` and `/connect` are wrapped in `DashboardLayout`.

### Provider Tree (main.tsx)

```
StrictMode
  → QueryClientProvider
    → SphereProvider (network="testnet")
      → ServicesProvider (GroupChat)
        → ConnectProvider (wallet connection intents)
          → ThemeInitializer
            → BrowserRouter
              → App
            → ToastContainer
```

### Source Structure

```
src/
├── main.tsx, App.tsx, index.css
├── sdk/                    # SDK adapter layer (21 files)
│   ├── SphereProvider.tsx, SphereContext.ts, types.ts, queryKeys.ts
│   ├── core/               # useSphere, useWalletStatus, useIdentity, useNametag, useSphereEvents, useIpfsSync
│   ├── payments/            # useTokens, useBalance, useAssets, useTransfer, useTransactionHistory
│   ├── l1/                  # useL1Balance, useL1Utxos, useL1Send, useL1Transactions
│   ├── comms/               # useSendDM, usePaymentRequests
│   └── utils/format.ts
├── hooks/                   # 12 app-level hooks
│   ├── useAgentChat, useActivityStream, useRecentActivity, useMarketFeed
│   ├── useTheme, useTutorial, useUIState, useDesktopState
│   ├── useGlobalSyncStatus, useVisualViewport, useKeyboardScrollIntoView, useMentionNavigation
├── components/
│   ├── agents/              # AgentCard, AgentChat, MerchChat, TriviaChat, GamesChat, IframeAgent
│   │   └── shared/          # ChatHistoryRepository, ChatBubble, ChatContainer, ChatInput, useChatHistory
│   ├── chat/                # ChatSection
│   │   ├── dm/              # DMChatSection, DMConversationList, DMMessageList
│   │   ├── group/           # GroupChatSection, GroupList, GroupMessageList
│   │   ├── mini/            # MiniChatWindow, miniChatStore
│   │   ├── hooks/           # useChat, useDmUnreadCount, useGroupChat, useGroupUnreadCount
│   │   ├── data/            # chatTypes (CHAT_KEYS, GROUP_CHAT_KEYS)
│   │   └── utils/           # avatarColors, groupChatHelpers
│   ├── wallet/
│   │   ├── L1/              # L1WalletModal, VestingDisplay, modals
│   │   ├── L3/              # L3WalletView, modals, currency utils
│   │   ├── onboarding/      # CreateWalletFlow, hooks
│   │   ├── shared/          # Shared wallet components, modals, hooks
│   │   └── ui/              # BaseModal, Button, ModalHeader
│   ├── layout/              # DashboardLayout, Header, IpfsSyncIndicator
│   ├── desktop/             # DesktopLayout, TabBar, Taskbar
│   ├── connect/             # ConnectIntentHandler, ConnectionApprovalModal, ConnectProvider
│   ├── splash/              # SplashScreen
│   ├── theme/               # ThemeInitializer, ThemeToggle
│   ├── tutorial/            # TutorialOverlay
│   └── ui/                  # ComingSoonModal, Toast
├── pages/                   # 10 page components (see Routes)
├── contexts/                # ServicesContext (GroupChat), ConnectProvider
├── services/                # ActivityService, FaucetService
├── config/storageKeys.ts    # All localStorage key constants
├── data/agentsMockData.ts   # Mock agent definitions
├── lib/queryClient.ts       # TanStack Query client
├── types/                   # activity.ts, index.ts
└── utils/                   # markdown, memory, mentionHandler, retry
```

### SDK Adapter Layer (`src/sdk/`)

**Event bridging** (`useSphereEvents`):
- `transfer:incoming` → invalidates payments queries + toast
- `transfer:confirmed` → invalidates payments
- `history:updated` → invalidates transaction history
- `identity:changed` → invalidates identity, payments, L1, chat queries
- `sync:completed`, `sync:remote-update` → invalidates payments
- `message:dm` → dispatches `dm-received` CustomEvent
- `composing:started` → dispatches `dm-typing` CustomEvent
- `payment_request:incoming` → dispatches `payment-requests-updated` Event

### Query Key Structure

```
SPHERE_KEYS:
  wallet: { exists, status }
  identity: { current, nametag, addresses }
  payments: { tokens, balance, assets, transactions }
  l1: { balance, utxos, transactions, vesting, blockHeight }
  communications: { conversations }
  market: { prices, registry }

CHAT_KEYS:
  conversations(addressId), messages(addressId, peerPubkey), unreadCount(addressId)

GROUP_CHAT_KEYS:
  all: ['groupChat']
```

### Custom Events

| Event | Dispatched from | Detail type |
|-------|----------------|-------------|
| `dm-received` | useSphereEvents | `DmReceivedDetail` |
| `dm-typing` | useSphereEvents | composing indicator |
| `payment-requests-updated` | useSphereEvents | — |
| `show-toast` | various | `ShowToastDetail` |
| `wallet-updated` | FaucetService, modals | — |
| `wallet-loaded` | onboarding flows | — |
| `agent-chat-history-updated` | ChatHistoryRepository | — |
| `dev-config-changed` | Header (dev settings) | — |

### localStorage Keys

All keys use `sphere_` prefix (centralized in `src/config/storageKeys.ts`):

**Fixed keys (STORAGE_KEYS):**
- `sphere_theme`, `sphere_tutorial_completed`, `sphere_chat_mode`
- `sphere_chat_selected_group`, `sphere_chat_selected_dm`
- `sphere_agent_chat_sessions`, `sphere_ipfs_enabled`, `sphere_desktop_state`
- `sphere_dev_aggregator_url`, `sphere_dev_skip_trust_base`

**Dynamic generators (STORAGE_KEY_GENERATORS):**
- `agentMemory(userId, activityId)` → `sphere_agent_memory:{userId}:{activityId}`
- `agentChatMessages(sessionId)` → `sphere_agent_chat_messages:{sessionId}`

Wallet encryption/storage is handled internally by the SDK.

## Environment Variables

See `.env.example` for full reference. Key variables:

```env
VITE_AGENT_API_URL          # Agentic chatbot backend (default: http://localhost:3000)
VITE_AGENT_API_KEY          # API key for SSE streaming
VITE_USE_MOCK_AGENTS        # Use mock agents (default: false)
VITE_AGGREGATOR_URL         # L3 aggregator (default: /rpc, proxied in dev)
VITE_NOSTR_RELAYS           # DM relays (comma-separated)
VITE_GROUP_CHAT_RELAYS      # Group chat relays (NIP-29)
VITE_ACTIVITY_API_URL       # Recent activity service
VITE_IPFS_GATEWAYS          # Custom IPFS gateways (comma-separated)
VITE_MIXPANEL_TOKEN         # Analytics token
VITE_WELCOME_AGENT_NAMETAG  # Welcome DM agent (default: kbbot)
VITE_SHOW_EXAMPLE_AGENT     # Show iframe dApp test agent
SSL_CERT_PATH               # HTTPS cert path for dev server
HMR_HOST                    # Remote HMR host
BASE_PATH                   # Deployment base path (default: /)
```

## Vite Configuration

- **Plugins:** @vitejs/plugin-react, @tailwindcss/vite, vite-plugin-node-polyfills
- **Proxies:**
  - `/rpc` → `https://goggregator-test.unicity.network` (L3 aggregator)
  - `/dev-rpc` → `https://dev-aggregator.dyndns.org` (dev aggregator)
  - `/coingecko` → `https://api.coingecko.com/api/v3` (price data)
- **Base path:** configurable via `BASE_PATH` env var
- **Node polyfills:** Buffer, process globals for `elliptic` and `crypto-js`

## Testing

Tests are in `tests/` and run with Vitest:
- `tests/unit/components/agents/shared/ChatHistoryRepository.test.ts` — comprehensive (38 tests)
- `tests/unit/config/storageKeys.test.ts` — storage key utilities (10 tests)
- Environment: jsdom
- Path alias: `@` maps to `/src` (vitest.config.ts)
- Globals enabled: `describe`, `it`, `expect`, `vi` available without imports

## TypeScript Configuration

- Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- App: Target ES2022, Module ESNext, bundler resolution
- Tests: Target ES2023
- Type checking: `npx tsc --noEmit`

## Developer Notes

### Crypto Libraries
Node polyfills (`vite-plugin-node-polyfills`) are needed for `elliptic` and `crypto-js`, used in `BridgeModal.tsx` for L1 bridge signing.

### Key External Dependencies
- `@unicitylabs/sphere-sdk` — Core SDK: L1/L3 operations, Nostr messaging, IPFS sync
- `elliptic` — secp256k1 cryptography for L1 bridge signing
- `crypto-js` — AES encryption for bridge operations
