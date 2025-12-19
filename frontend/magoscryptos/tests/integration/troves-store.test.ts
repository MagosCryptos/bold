import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { troves } from '$lib/stores/troves.svelte';
import { graphqlClient } from '$lib/graphql';
import type { Trove, TrovesByAccountResponse } from '$lib/graphql';

// Mock the graphql client
vi.mock('$lib/graphql', async (importOriginal) => {
	const original = await importOriginal<typeof import('$lib/graphql')>();
	return {
		...original,
		graphqlClient: {
			request: vi.fn()
		}
	};
});

// Mock prices store
vi.mock('$lib/stores/prices.svelte', () => ({
	prices: {
		getRawPrice: vi.fn((symbol: string) => {
			const prices: Record<string, bigint> = {
				ETH: BigInt('3500000000000000000000'), // $3500
				WSTETH: BigInt('4000000000000000000000'), // $4000
				RETH: BigInt('3800000000000000000000') // $3800
			};
			return prices[symbol];
		}),
		formattedPrices: {
			ETH: 3500,
			WSTETH: 4000,
			RETH: 3800
		},
		loading: false
	}
}));

// Sample trove data matching subgraph schema
const mockTrove: Trove = {
	id: '0x123-0',
	troveId: '12345',
	borrower: '0xabc123',
	debt: '10000000000000000000000', // 10,000 BOLD
	deposit: '5000000000000000000', // 5 ETH
	stake: '5000000000000000000',
	interestRate: '50000000000000000', // 5%
	createdAt: '1700000000',
	updatedAt: '1700000000',
	closedAt: null,
	status: 'active',
	collateral: {
		id: '0x0',
		collIndex: 0 // ETH
	},
	interestBatch: null,
	mightBeLeveraged: false
};

const mockClosedTrove: Trove = {
	...mockTrove,
	id: '0x456-1',
	troveId: '67890',
	status: 'closedByOwner',
	closedAt: '1700100000',
	collateral: {
		id: '0x1',
		collIndex: 1 // WSTETH
	}
};

describe('TrovesStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		troves.clear();
	});

	afterEach(() => {
		troves.clear();
	});

	describe('initialization', () => {
		it('starts with empty state', () => {
			expect(troves.rawTroves).toEqual([]);
			expect(troves.loading).toBe(false);
			expect(troves.error).toBe(null);
			expect(troves.lastUpdated).toBe(null);
		});

		it('has empty derived values initially', () => {
			expect(troves.troves).toEqual([]);
			expect(troves.activeTroves).toEqual([]);
			expect(troves.totalDebt).toBe(0n);
		});
	});

	describe('fetchTroves', () => {
		it('fetches troves for a borrower address', async () => {
			const mockResponse: TrovesByAccountResponse = {
				troves: [mockTrove]
			};
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(graphqlClient.request).toHaveBeenCalledWith(expect.anything(), {
				borrower: '0xabc123'
			});
			expect(troves.rawTroves).toHaveLength(1);
			expect(troves.loading).toBe(false);
			expect(troves.lastUpdated).toBeInstanceOf(Date);
		});

		it('lowercases borrower address before query', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xABC123DEF');

			expect(graphqlClient.request).toHaveBeenCalledWith(expect.anything(), {
				borrower: '0xabc123def'
			});
		});

		it('sets loading state during fetch', async () => {
			let resolveRequest: (value: TrovesByAccountResponse) => void;
			const promise = new Promise<TrovesByAccountResponse>((resolve) => {
				resolveRequest = resolve;
			});
			vi.mocked(graphqlClient.request).mockReturnValueOnce(promise);

			const fetchPromise = troves.fetchTroves('0xabc123');
			expect(troves.loading).toBe(true);

			resolveRequest!({ troves: [] });
			await fetchPromise;

			expect(troves.loading).toBe(false);
		});

		it('handles fetch errors gracefully', async () => {
			const error = new Error('Network error');
			vi.mocked(graphqlClient.request).mockRejectedValueOnce(error);

			await troves.fetchTroves('0xabc123');

			expect(troves.error).toEqual(error);
			expect(troves.loading).toBe(false);
			expect(troves.rawTroves).toEqual([]);
		});

		it('clears previous error on new fetch', async () => {
			// First fetch fails
			vi.mocked(graphqlClient.request).mockRejectedValueOnce(new Error('Failed'));
			await troves.fetchTroves('0xabc123');
			expect(troves.error).not.toBe(null);

			// Second fetch succeeds
			vi.mocked(graphqlClient.request).mockResolvedValueOnce({ troves: [] });
			await troves.fetchTroves('0xabc123');

			expect(troves.error).toBe(null);
		});
	});

	describe('derived troves', () => {
		it('formats raw troves with collateral symbol', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			const formatted = troves.troves[0];
			expect(formatted.collateralSymbol).toBe('ETH'); // Mapped from index 0
			expect(formatted.deposit).toBe(BigInt(mockTrove.deposit));
			expect(formatted.debt).toBe(BigInt(mockTrove.debt));
			expect(formatted.status).toBe('active');
		});

		it('calculates interest rate percentage', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			// 5% = 50000000000000000 / 1e18 * 100
			expect(troves.troves[0].interestRatePercent).toBeCloseTo(5, 1);
		});

		it('calculates collateral ratio when price available', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			// 5 ETH * $3500 / 10,000 BOLD = 175%
			const cr = troves.troves[0].collateralRatio;
			expect(cr).toBeCloseTo(175, 0);
		});
	});

	describe('activeTroves', () => {
		it('filters to only active troves', async () => {
			const mockResponse: TrovesByAccountResponse = {
				troves: [mockTrove, mockClosedTrove]
			};
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(troves.troves).toHaveLength(2);
			expect(troves.activeTroves).toHaveLength(1);
			expect(troves.activeTroves[0].status).toBe('active');
		});
	});

	describe('totalDebt', () => {
		it('sums debt across all active troves', async () => {
			const trove2 = {
				...mockTrove,
				id: '0x789-0',
				troveId: '99999',
				debt: '5000000000000000000000' // 5,000 BOLD
			};
			const mockResponse: TrovesByAccountResponse = {
				troves: [mockTrove, trove2, mockClosedTrove]
			};
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			// 10,000 + 5,000 = 15,000 BOLD (closed trove excluded)
			expect(troves.totalDebt).toBe(BigInt('15000000000000000000000'));
		});
	});

	describe('getTrove', () => {
		it('finds trove by collateral index and trove ID', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			const found = troves.getTrove(0, '12345');
			expect(found).toBeDefined();
			expect(found?.troveId).toBe('12345');
		});

		it('returns undefined for non-existent trove', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(troves.getTrove(0, 'nonexistent')).toBeUndefined();
			expect(troves.getTrove(99, '12345')).toBeUndefined();
		});
	});

	describe('getActiveTroveByCollateral', () => {
		it('finds active trove by collateral symbol', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			const found = troves.getActiveTroveByCollateral('ETH');
			expect(found).toBeDefined();
			expect(found?.collateralSymbol).toBe('ETH');
		});

		it('returns undefined for collateral without active trove', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockClosedTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(troves.getActiveTroveByCollateral('WSTETH')).toBeUndefined();
		});
	});

	describe('hasActiveTroves', () => {
		it('returns true when user has active troves', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(troves.hasActiveTroves()).toBe(true);
		});

		it('returns false when no active troves', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockClosedTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');

			expect(troves.hasActiveTroves()).toBe(false);
		});

		it('returns false when no troves at all', () => {
			expect(troves.hasActiveTroves()).toBe(false);
		});
	});

	describe('clear', () => {
		it('resets all state', async () => {
			const mockResponse: TrovesByAccountResponse = { troves: [mockTrove] };
			vi.mocked(graphqlClient.request).mockResolvedValueOnce(mockResponse);

			await troves.fetchTroves('0xabc123');
			expect(troves.rawTroves).toHaveLength(1);

			troves.clear();

			expect(troves.rawTroves).toEqual([]);
			expect(troves.borrowerInfo).toBe(null);
			expect(troves.error).toBe(null);
			expect(troves.lastUpdated).toBe(null);
		});
	});
});

describe('GraphQL integration', () => {
	it('isSubgraphConfigured returns true when URL is set', async () => {
		const { isSubgraphConfigured } = await import('$lib/graphql');
		expect(isSubgraphConfigured()).toBe(true);
	});
});
