# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liquity V2 (BOLD) is a decentralized stablecoin borrowing protocol. Users lock WETH or LSTs (rETH, wstETH) as collateral in "Troves" to borrow BOLD stablecoins. Key features include user-set interest rates, multi-collateral branches, NFT-based Troves, and batch delegation.

## Repository Structure

pnpm monorepo with 5 packages:
- `/contracts` - Solidity smart contracts (Foundry + Hardhat)
- `/frontend/app` - Next.js 15 frontend application
- `/frontend/uikit` - Shared React component library (Panda CSS)
- `/frontend/uikit-gallery` - Component showcase (React Cosmos)
- `/subgraph` - The Graph protocol subgraph for data indexing

## Prerequisites

- Node.js v20
- pnpm v8
- Foundry (for contract development)

## Common Commands

### Setup
```bash
pnpm install                    # Install all dependencies
cd contracts && forge install   # Install Foundry deps (if developing contracts)
```

### Contracts (`/contracts`)
```bash
forge build                     # Compile contracts
forge test                      # Run Solidity tests
forge test -vvv                 # Run with verbose output
forge test --match-contract X   # Run specific test
forge test --no-match-contract Mainnet  # Skip mainnet fork tests
pnpm test                       # Run Hardhat/JS tests
forge fmt                       # Format Solidity
```

### Frontend (`/frontend/app`)
```bash
pnpm build-deps                 # Build dependencies (run once before dev)
pnpm dev                        # Start dev server (localhost:3000)
pnpm build                      # Production build
pnpm lint                       # Run oxlint
pnpm test                       # Run vitest
pnpm fmt                        # Format with dprint
pnpm update-liquity-abis        # Sync ABIs from contracts
```

### UIKit (`/frontend/uikit`)
```bash
pnpm build                      # Build library
pnpm build-panda                # Generate Panda CSS styles
```

### Subgraph (`/subgraph`)
```bash
./start-graph                   # Run graph node
./deploy-subgraph local --version v1 --create  # Deploy locally
```

### Formatting (root)
```bash
dprint fmt                      # Format all code (TS, JSON, MD, TOML, GraphQL)
```

## Local Development

1. Start anvil: `anvil`
2. Deploy contracts: `cd contracts && ./deploy local --open-demo-troves`
3. Get addresses: `pnpm tsx utils/deployment-manifest-to-app-env.ts deployment-manifest.json`
4. Configure frontend: `cd frontend/app && cp .env .env.local` (add addresses, uncomment Anvil section)
5. Start app: `pnpm dev`

## Architecture

### Smart Contracts
Core contracts in `/contracts/src/`:
- `BorrowerOperations.sol` - Opening/adjusting/closing Troves
- `TroveManager.sol` - Trove state, liquidations, redemptions
- `StabilityPool.sol` - BOLD deposits for liquidation offsets
- `BoldToken.sol` - ERC20 stablecoin
- `ActivePool.sol` - Holds collateral for active Troves
- `CollateralRegistry.sol` - Routes redemptions across branches
- `TroveNFT.sol` - NFT representation of Troves

Each collateral type (WETH, rETH, wstETH) has its own branch with separate TroveManager and StabilityPool instances.

### Frontend
- `/src/screens/` - Page-level screen components
- `/src/comps/` - Reusable UI components
- `/src/tx-flows/` - Transaction flow handlers (borrowing, repayment, etc.)
- `/src/services/` - API and service layer
- `/src/abi/` - Contract ABIs (synced from contracts package)

Web3 stack: Wagmi, Viem, ConnectKit, TanStack Query

### Subgraph
Event handlers in `/subgraph/src/` index contract events for GraphQL queries. Schema defined in `schema.graphql`.

## Key Concepts

- **Troves**: Collateralized debt positions. Users deposit collateral and borrow BOLD.
- **Interest Rates**: User-selected annual rates. Higher rates provide more redemption protection.
- **Redemptions**: 1 BOLD can be redeemed for $1 of collateral. Routes across branches by "unbackedness".
- **Zombie Troves**: Troves with debt below MIN_DEBT after redemption. Cannot be redeemed further.
- **Batch Delegation**: Batch managers can adjust interest rates for multiple Troves gas-efficiently.
- **Branch Shutdown**: Extreme price drops or oracle failures trigger branch shutdown with urgent redemptions.

## Testing

Contracts use two test frameworks:
- Foundry (`.t.sol` files) for Solidity tests
- Hardhat (JS tests in `/test-js/`) for integration tests

Frontend uses Vitest for unit tests.

## Environment Variables

Frontend requires `.env.local` with contract addresses and subgraph URL. See `/frontend/app/README.md` for full variable documentation. Key required variables:
- `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_CHAIN_RPC_URL`
- `NEXT_PUBLIC_SUBGRAPH_URL`
- `NEXT_PUBLIC_CONTRACT_*` (contract addresses)
