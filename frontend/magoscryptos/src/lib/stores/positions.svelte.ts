import { readContracts } from '@wagmi/core';
import type { Address, BranchId, CollateralSymbol, EarnPosition } from '$lib/types';
import { wagmiConfig, getBranchContract, BRANCHES } from '$lib/web3';
import { wallet } from './wallet.svelte';

// Svelte 5 runes-based positions store
class PositionsStore {
	// Earn positions (Stability Pool deposits)
	earnPositions = $state<EarnPosition[]>([]);
	earnLoading = $state(false);
	earnError = $state<Error | null>(null);

	// Derived state
	hasAnyEarnPosition = $derived(this.earnPositions.some((p) => p.deposit > 0n));

	totalEarnDeposits = $derived(
		this.earnPositions.reduce((sum, p) => sum + p.deposit, 0n)
	);

	/**
	 * Fetch earn positions for connected wallet
	 */
	async fetchEarnPositions() {
		const address = wallet.address;
		if (!address) {
			this.earnPositions = [];
			return;
		}

		this.earnLoading = true;
		this.earnError = null;

		try {
			const positions = await Promise.all(
				BRANCHES.map(async (branch) => {
					const SP = getBranchContract(branch.id as BranchId, 'StabilityPool');

					const results = await readContracts(wagmiConfig, {
						contracts: [
							{
								...SP,
								functionName: 'getCompoundedBoldDeposit',
								args: [address]
							},
							{
								...SP,
								functionName: 'getDepositorCollGain',
								args: [address]
							},
							{
								...SP,
								functionName: 'getDepositorYieldGainWithPending',
								args: [address]
							}
						],
						allowFailure: true
					});

					return {
						branchId: branch.id as BranchId,
						symbol: branch.symbol,
						deposit: (results[0].result as bigint) ?? 0n,
						collGain: (results[1].result as bigint) ?? 0n,
						yieldGain: (results[2].result as bigint) ?? 0n
					};
				})
			);

			this.earnPositions = positions;
		} catch (e) {
			this.earnError = e instanceof Error ? e : new Error('Failed to fetch positions');
			console.error('Failed to fetch earn positions:', e);
		} finally {
			this.earnLoading = false;
		}
	}

	/**
	 * Get earn position for a specific symbol
	 */
	getEarnPosition(symbol: CollateralSymbol): EarnPosition | undefined {
		return this.earnPositions.find((p) => p.symbol === symbol);
	}

	/**
	 * Clear all positions (e.g., on disconnect)
	 */
	clear() {
		this.earnPositions = [];
		this.earnError = null;
	}
}

// Export singleton instance
export const positions = new PositionsStore();
