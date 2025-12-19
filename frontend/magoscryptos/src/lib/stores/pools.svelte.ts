import { readContracts } from '@wagmi/core';
import type { BranchId, CollateralSymbol, PoolStats } from '$lib/types';
import { wagmiConfig, getBranchContract, BRANCHES } from '$lib/web3';

// Svelte 5 runes-based pools store
class PoolsStore {
	// Pool stats for each branch
	pools = $state<PoolStats[]>([]);
	loading = $state(false);
	error = $state<Error | null>(null);
	lastUpdated = $state<Date | null>(null);

	// Derived state
	totalTvl = $derived(this.pools.reduce((sum, p) => sum + p.totalDeposits, 0n));

	formattedTotalTvl = $derived(
		this.totalTvl > 0n ? (Number(this.totalTvl) / 1e18).toLocaleString() : '0'
	);

	/**
	 * Fetch pool stats for all branches
	 */
	async fetchPoolStats() {
		if (typeof window === 'undefined') return;

		this.loading = true;
		this.error = null;

		try {
			const stats = await Promise.all(
				BRANCHES.map(async (branch) => {
					const SP = getBranchContract(branch.id as BranchId, 'StabilityPool');

					const results = await readContracts(wagmiConfig, {
						contracts: [
							{
								...SP,
								functionName: 'getTotalBoldDeposits'
							},
							{
								...SP,
								functionName: 'getCollBalance'
							}
						],
						allowFailure: true
					});

					return {
						branchId: branch.id as BranchId,
						symbol: branch.symbol,
						totalDeposits: (results[0].result as bigint) ?? 0n,
						collBalance: (results[1].result as bigint) ?? 0n
					};
				})
			);

			this.pools = stats;
			this.lastUpdated = new Date();
		} catch (e) {
			this.error = e instanceof Error ? e : new Error('Failed to fetch pool stats');
			console.error('Failed to fetch pool stats:', e);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Get pool stats for a specific symbol
	 */
	getPool(symbol: CollateralSymbol): PoolStats | undefined {
		return this.pools.find((p) => p.symbol === symbol);
	}

	/**
	 * Get formatted TVL for a specific pool
	 */
	getFormattedTvl(symbol: CollateralSymbol): string {
		const pool = this.getPool(symbol);
		if (!pool || pool.totalDeposits === 0n) return '0';
		return (Number(pool.totalDeposits) / 1e18).toLocaleString(undefined, {
			maximumFractionDigits: 0
		});
	}

	/**
	 * Start auto-refresh of pool stats
	 */
	startAutoRefresh(intervalMs = 60000): () => void {
		// Fetch immediately
		this.fetchPoolStats();

		// Set up interval
		const interval = setInterval(() => {
			this.fetchPoolStats();
		}, intervalMs);

		// Return cleanup function
		return () => clearInterval(interval);
	}
}

// Export singleton instance
export const pools = new PoolsStore();
