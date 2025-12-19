import { getAccount, watchAccount, disconnect, getBalance } from '@wagmi/core';
import type { Address } from '$lib/types';
import { wagmiConfig, openWalletModal } from '$lib/web3';

// Svelte 5 runes-based wallet store
class WalletStore {
	// Core state
	address = $state<Address | undefined>(undefined);
	chainId = $state<number | undefined>(undefined);
	isConnected = $state(false);
	isConnecting = $state(false);
	isReconnecting = $state(false);

	// Balance state
	ethBalance = $state<bigint | undefined>(undefined);
	ethBalanceLoading = $state(false);

	// Derived state
	shortAddress = $derived(
		this.address ? `${this.address.slice(0, 6)}...${this.address.slice(-4)}` : undefined
	);

	formattedEthBalance = $derived(
		this.ethBalance !== undefined ? (Number(this.ethBalance) / 1e18).toFixed(4) : undefined
	);

	private unwatch: (() => void) | undefined;

	constructor() {
		// Initialize only in browser
		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	private init() {
		// Get initial account state
		const account = getAccount(wagmiConfig);
		this.updateFromAccount(account);

		// Watch for account changes
		this.unwatch = watchAccount(wagmiConfig, {
			onChange: (account) => {
				this.updateFromAccount(account);
				// Fetch balance when connected
				if (account.isConnected && account.address) {
					this.fetchEthBalance();
				}
			}
		});
	}

	private updateFromAccount(account: ReturnType<typeof getAccount>) {
		this.address = account.address;
		this.chainId = account.chainId;
		this.isConnected = account.isConnected;
		this.isConnecting = account.isConnecting;
		this.isReconnecting = account.isReconnecting;
	}

	/**
	 * Open the wallet connection modal
	 */
	connect() {
		openWalletModal();
	}

	/**
	 * Disconnect the wallet
	 */
	async disconnectWallet() {
		await disconnect(wagmiConfig);
		this.ethBalance = undefined;
	}

	/**
	 * Fetch ETH balance for connected address
	 */
	async fetchEthBalance() {
		if (!this.address) {
			this.ethBalance = undefined;
			return;
		}

		this.ethBalanceLoading = true;
		try {
			const balance = await getBalance(wagmiConfig, {
				address: this.address
			});
			this.ethBalance = balance.value;
		} catch (error) {
			console.error('Failed to fetch ETH balance:', error);
			this.ethBalance = undefined;
		} finally {
			this.ethBalanceLoading = false;
		}
	}

	/**
	 * Cleanup - call when component unmounts
	 */
	destroy() {
		if (this.unwatch) {
			this.unwatch();
		}
	}
}

// Export singleton instance
export const wallet = new WalletStore();
