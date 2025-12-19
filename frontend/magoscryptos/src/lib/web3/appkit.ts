import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { chain } from './config';
import { WALLET_CONNECT_PROJECT_ID } from './env';

// Create the Wagmi adapter for AppKit
// This adapter creates its own wagmiConfig internally which we must use
const wagmiAdapter = new WagmiAdapter({
	projectId: WALLET_CONNECT_PROJECT_ID,
	networks: [chain]
});

// Export the wagmiConfig from the adapter - this is the one that gets updated when wallet connects
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Metadata for the app
const metadata = {
	name: 'MagosCryptos',
	description: 'Liquity V2 Interface - Borrow BOLD stablecoins against ETH and LSTs',
	url: typeof window !== 'undefined' ? window.location.origin : 'https://magoscryptos.com',
	icons: ['/favicon.svg']
};

// Create AppKit instance (only in browser)
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

export function getAppKit() {
	if (typeof window === 'undefined') {
		return null;
	}

	if (!appKitInstance && WALLET_CONNECT_PROJECT_ID) {
		appKitInstance = createAppKit({
			adapters: [wagmiAdapter],
			projectId: WALLET_CONNECT_PROJECT_ID,
			networks: [chain],
			metadata,
			themeMode: 'light',
			features: {
				analytics: false,
				email: false,
				socials: false
			}
		});
	}

	return appKitInstance;
}

// Helper to open the wallet modal
export function openWalletModal() {
	const appKit = getAppKit();
	if (appKit) {
		appKit.open();
	}
}

// Helper to close the wallet modal
export function closeWalletModal() {
	const appKit = getAppKit();
	if (appKit) {
		appKit.close();
	}
}
