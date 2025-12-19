import { type Chain } from 'viem';
import { CHAIN_CONFIG } from './env';

// Define the chain from environment config
export const chain: Chain = {
	id: CHAIN_CONFIG.id,
	name: CHAIN_CONFIG.name,
	nativeCurrency: {
		name: CHAIN_CONFIG.currency.name,
		symbol: CHAIN_CONFIG.currency.symbol,
		decimals: CHAIN_CONFIG.currency.decimals
	},
	rpcUrls: {
		default: {
			http: [CHAIN_CONFIG.rpcUrl]
		}
	},
	blockExplorers: CHAIN_CONFIG.blockExplorer
		? {
				default: {
					name: CHAIN_CONFIG.blockExplorer.name,
					url: CHAIN_CONFIG.blockExplorer.url
				}
			}
		: undefined
};

// Note: wagmiConfig is exported from appkit.ts (from the WagmiAdapter)
// This ensures we use the same config that AppKit uses for wallet connections

export { CHAIN_CONFIG };
