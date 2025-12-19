import {
	graphqlClient,
	TROVES_BY_ACCOUNT,
	ACTIVE_TROVES_BY_ACCOUNT,
	BORROWER_INFO,
	formatTrove,
	calculateCollateralRatio,
	type Trove,
	type TrovesByAccountResponse,
	type BorrowerInfoResponse,
	type FormattedTrove
} from '$lib/graphql';
import { prices } from './prices.svelte';

// Collateral symbols for formatting
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

// Svelte 5 runes-based troves store
class TrovesStore {
	// Raw troves from subgraph
	rawTroves = $state<Trove[]>([]);

	// Loading and error states
	loading = $state(false);
	error = $state<Error | null>(null);
	lastUpdated = $state<Date | null>(null);

	// Borrower info
	borrowerInfo = $state<{ troves: number; trovesByCollateral: number[] } | null>(null);

	// Formatted troves with calculated values
	troves = $derived.by<FormattedTrove[]>(() => {
		return this.rawTroves.map((trove) => {
			const formatted = formatTrove(trove, COLLATERAL_SYMBOLS);

			// Calculate collateral ratio if we have price data
			const price = prices.getRawPrice(formatted.collateralSymbol as 'ETH' | 'WSTETH' | 'RETH');
			if (price !== undefined) {
				formatted.collateralRatio = calculateCollateralRatio(
					formatted.deposit,
					formatted.debt,
					price
				);
			}

			return formatted;
		});
	});

	// Active troves only
	activeTroves = $derived(this.troves.filter((t) => t.status === 'active'));

	// Troves grouped by collateral
	trovesByCollateral = $derived.by(() => {
		const grouped: Record<string, FormattedTrove[]> = {
			ETH: [],
			WSTETH: [],
			RETH: []
		};
		for (const trove of this.troves) {
			if (grouped[trove.collateralSymbol]) {
				grouped[trove.collateralSymbol].push(trove);
			}
		}
		return grouped;
	});

	// Total debt across all troves
	totalDebt = $derived(
		this.activeTroves.reduce((sum, t) => sum + t.debt, 0n)
	);

	// Total collateral value in USD (if prices available)
	totalCollateralValue = $derived.by(() => {
		let total = 0n;
		for (const trove of this.activeTroves) {
			const price = prices.getRawPrice(trove.collateralSymbol as 'ETH' | 'WSTETH' | 'RETH');
			if (price !== undefined) {
				total += (trove.deposit * price) / BigInt(1e18);
			}
		}
		return total;
	});

	/**
	 * Fetch all troves for a specific borrower address
	 */
	async fetchTroves(borrower: string, activeOnly = false) {
		if (typeof window === 'undefined') return;

		this.loading = true;
		this.error = null;

		try {
			const query = activeOnly ? ACTIVE_TROVES_BY_ACCOUNT : TROVES_BY_ACCOUNT;
			const data = await graphqlClient.request<TrovesByAccountResponse>(query, {
				borrower: borrower.toLowerCase()
			});

			this.rawTroves = data.troves;
			this.lastUpdated = new Date();
		} catch (e) {
			this.error = e instanceof Error ? e : new Error('Failed to fetch troves');
			console.error('Failed to fetch troves:', e);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Fetch borrower info (trove counts)
	 */
	async fetchBorrowerInfo(borrower: string) {
		if (typeof window === 'undefined') return;

		try {
			const data = await graphqlClient.request<BorrowerInfoResponse>(BORROWER_INFO, {
				id: borrower.toLowerCase()
			});

			if (data.borrowerInfo) {
				this.borrowerInfo = {
					troves: data.borrowerInfo.troves,
					trovesByCollateral: data.borrowerInfo.trovesByCollateral
				};
			} else {
				this.borrowerInfo = { troves: 0, trovesByCollateral: [0, 0, 0] };
			}
		} catch (e) {
			console.error('Failed to fetch borrower info:', e);
		}
	}

	/**
	 * Get a specific trove by collateral and trove ID
	 */
	getTrove(collateralIndex: number, troveId: string): FormattedTrove | undefined {
		return this.troves.find(
			(t) => t.collateralIndex === collateralIndex && t.troveId === troveId
		);
	}

	/**
	 * Get active trove for a specific collateral (assumes one per collateral)
	 */
	getActiveTroveByCollateral(collateralSymbol: string): FormattedTrove | undefined {
		return this.activeTroves.find((t) => t.collateralSymbol === collateralSymbol);
	}

	/**
	 * Check if user has any active troves
	 */
	hasActiveTroves(): boolean {
		return this.activeTroves.length > 0;
	}

	/**
	 * Clear all trove data
	 */
	clear() {
		this.rawTroves = [];
		this.borrowerInfo = null;
		this.error = null;
		this.lastUpdated = null;
	}
}

// Export singleton instance
export const troves = new TrovesStore();
