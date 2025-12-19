import { graphqlClient } from '$lib/graphql';
import {
	INTEREST_RATE_BRACKETS,
	ACTIVE_TROVES_COUNT,
	COLLATERALS,
	type InterestRateBracketsResponse,
	type ActiveTrovesCountResponse,
	type CollateralsResponse,
	type BranchStats,
	type ProtocolStats
} from '$lib/graphql/queries/stats';

// Collateral symbols for formatting
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

// Svelte 5 runes-based protocol stats store
class ProtocolStatsStore {
	// Raw data from subgraph
	private interestBrackets = $state<InterestRateBracketsResponse | null>(null);
	private troveCounts = $state<ActiveTrovesCountResponse | null>(null);
	private collaterals = $state<CollateralsResponse | null>(null);

	// Loading and error states
	loading = $state(false);
	error = $state<Error | null>(null);
	lastUpdated = $state<Date | null>(null);

	// Computed protocol stats
	stats = $derived.by<ProtocolStats | null>(() => {
		if (!this.interestBrackets || !this.troveCounts) {
			return null;
		}

		// Aggregate debt per branch from interest rate brackets
		const debtByBranch: Record<number, bigint> = { 0: 0n, 1: 0n, 2: 0n };
		for (const bracket of this.interestBrackets.interestRateBrackets) {
			const idx = bracket.collateral.collIndex;
			debtByBranch[idx] = (debtByBranch[idx] || 0n) + BigInt(bracket.totalDebt);
		}

		// Get trove counts per branch
		const troveCountByBranch: Record<number, number> = {
			0: this.troveCounts.coll0.length,
			1: this.troveCounts.coll1.length,
			2: this.troveCounts.coll2.length
		};

		// Get min collateral ratios
		const minCollRatioByBranch: Record<number, number> = { 0: 110, 1: 120, 2: 120 };
		if (this.collaterals) {
			for (const coll of this.collaterals.collaterals) {
				// Convert from 18 decimals to percentage
				minCollRatioByBranch[coll.collIndex] =
					Number(BigInt(coll.minCollRatio) / BigInt(1e16));
			}
		}

		// Build branch stats
		const branches: BranchStats[] = [0, 1, 2].map((idx) => ({
			collateralIndex: idx,
			collateralSymbol: COLLATERAL_SYMBOLS[idx] || 'UNKNOWN',
			totalDebt: debtByBranch[idx] || 0n,
			activeTroves: troveCountByBranch[idx] || 0,
			minCollRatio: minCollRatioByBranch[idx] || 110
		}));

		// Calculate totals
		const totalDebt = branches.reduce((sum, b) => sum + b.totalDebt, 0n);
		const totalActiveTroves = branches.reduce((sum, b) => sum + b.activeTroves, 0);

		return {
			branches,
			totalDebt,
			totalActiveTroves
		};
	});

	// Formatted total debt in millions
	formattedTotalDebt = $derived.by(() => {
		if (!this.stats) return null;
		const debt = Number(this.stats.totalDebt) / 1e18;
		if (debt >= 1_000_000) return `${(debt / 1_000_000).toFixed(2)}M`;
		if (debt >= 1_000) return `${(debt / 1_000).toFixed(2)}K`;
		return debt.toFixed(2);
	});

	// Get stats for a specific branch
	getBranchStats(collateralSymbol: string): BranchStats | undefined {
		return this.stats?.branches.find((b) => b.collateralSymbol === collateralSymbol);
	}

	// Get formatted debt for a branch
	getFormattedBranchDebt(collateralSymbol: string): string {
		const branch = this.getBranchStats(collateralSymbol);
		if (!branch) return '-';
		const debt = Number(branch.totalDebt) / 1e18;
		if (debt >= 1_000_000) return `${(debt / 1_000_000).toFixed(1)}M`;
		if (debt >= 1_000) return `${(debt / 1_000).toFixed(1)}K`;
		return debt.toFixed(0);
	}

	/**
	 * Fetch all protocol stats from subgraph
	 */
	async fetchStats() {
		if (typeof window === 'undefined') return;

		this.loading = true;
		this.error = null;

		try {
			// Fetch all data in parallel
			const [bracketsData, trovesData, collateralsData] = await Promise.all([
				graphqlClient.request<InterestRateBracketsResponse>(INTEREST_RATE_BRACKETS),
				graphqlClient.request<ActiveTrovesCountResponse>(ACTIVE_TROVES_COUNT),
				graphqlClient.request<CollateralsResponse>(COLLATERALS)
			]);

			this.interestBrackets = bracketsData;
			this.troveCounts = trovesData;
			this.collaterals = collateralsData;
			this.lastUpdated = new Date();
		} catch (e) {
			this.error = e instanceof Error ? e : new Error('Failed to fetch protocol stats');
			console.error('Failed to fetch protocol stats:', e);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Clear all stats data
	 */
	clear() {
		this.interestBrackets = null;
		this.troveCounts = null;
		this.collaterals = null;
		this.error = null;
		this.lastUpdated = null;
	}
}

// Export singleton instance
export const protocolStats = new ProtocolStatsStore();
