import { readContract } from '@wagmi/core';
import type { BranchId, CollateralSymbol } from '$lib/types';
import { wagmiConfig, getBranchContract, BRANCHES } from '$lib/web3';

// Svelte 5 runes-based prices store
class PricesStore {
	// Raw prices in 18 decimal format
	prices = $state<Record<CollateralSymbol, bigint | undefined>>({
		ETH: undefined,
		WSTETH: undefined,
		RETH: undefined
	});

	loading = $state(false);
	error = $state<Error | null>(null);
	lastUpdated = $state<Date | null>(null);

	// Derived formatted prices (as numbers)
	formattedPrices = $derived({
		ETH: this.prices.ETH !== undefined ? Number(this.prices.ETH) / 1e18 : undefined,
		WSTETH: this.prices.WSTETH !== undefined ? Number(this.prices.WSTETH) / 1e18 : undefined,
		RETH: this.prices.RETH !== undefined ? Number(this.prices.RETH) / 1e18 : undefined
	});

	// Check if any price is loaded
	hasAnyPrice = $derived(
		this.prices.ETH !== undefined ||
			this.prices.WSTETH !== undefined ||
			this.prices.RETH !== undefined
	);

	/**
	 * Fetch price for a specific branch
	 * Uses lastGoodPrice as primary source (always returns cached price)
	 * Falls back to getPrice if needed
	 */
	async fetchPrice(branchId: BranchId) {
		const branch = BRANCHES[branchId];
		if (!branch) return;

		try {
			const PriceFeed = getBranchContract(branchId, 'PriceFeed');

			// Use lastGoodPrice - this is the cached price that won't revert
			// getPrice() can revert when oracle conditions aren't met
			const price = await readContract(wagmiConfig, {
				...PriceFeed,
				functionName: 'lastGoodPrice'
			});

			this.prices = {
				...this.prices,
				[branch.symbol]: price as bigint
			};
		} catch (e) {
			// Try getPrice as fallback (might work in some cases)
			try {
				const PriceFeed = getBranchContract(branchId, 'PriceFeed');
				const price = await readContract(wagmiConfig, {
					...PriceFeed,
					functionName: 'getPrice'
				});

				this.prices = {
					...this.prices,
					[branch.symbol]: price as bigint
				};
			} catch (fallbackError) {
				console.warn(`Could not fetch price for ${branch.symbol}, using placeholder`);
				// Don't clear the price on error, keep the old value
			}
		}
	}

	/**
	 * Fetch all prices
	 */
	async fetchAllPrices() {
		if (typeof window === 'undefined') return;

		this.loading = true;
		this.error = null;

		try {
			await Promise.all([this.fetchPrice(0), this.fetchPrice(1), this.fetchPrice(2)]);

			this.lastUpdated = new Date();
		} catch (e) {
			this.error = e instanceof Error ? e : new Error('Failed to fetch prices');
			console.error('Failed to fetch prices:', e);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Get price for a specific symbol
	 */
	getPrice(symbol: CollateralSymbol): number | undefined {
		return this.formattedPrices[symbol];
	}

	/**
	 * Get raw price (18 decimals) for a specific symbol
	 */
	getRawPrice(symbol: CollateralSymbol): bigint | undefined {
		return this.prices[symbol];
	}

	/**
	 * Start auto-refresh of prices
	 */
	startAutoRefresh(intervalMs = 30000): () => void {
		// Fetch immediately
		this.fetchAllPrices();

		// Set up interval
		const interval = setInterval(() => {
			this.fetchAllPrices();
		}, intervalMs);

		// Return cleanup function
		return () => clearInterval(interval);
	}
}

// Export singleton instance
export const prices = new PricesStore();
