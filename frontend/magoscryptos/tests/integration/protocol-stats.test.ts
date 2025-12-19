import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { protocolStats } from '$lib/stores/stats.svelte';
import { graphqlClient } from '$lib/graphql';
import type {
	InterestRateBracketsResponse,
	ActiveTrovesCountResponse,
	CollateralsResponse
} from '$lib/graphql/queries/stats';

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

// Mock responses
const mockBracketsResponse: InterestRateBracketsResponse = {
	interestRateBrackets: [
		{
			collateral: { collIndex: 0 },
			rate: '50000000000000000', // 5%
			totalDebt: '10000000000000000000000000' // 10M BOLD
		},
		{
			collateral: { collIndex: 0 },
			rate: '60000000000000000', // 6%
			totalDebt: '5000000000000000000000000' // 5M BOLD
		},
		{
			collateral: { collIndex: 1 },
			rate: '45000000000000000', // 4.5%
			totalDebt: '8000000000000000000000000' // 8M BOLD
		},
		{
			collateral: { collIndex: 2 },
			rate: '55000000000000000', // 5.5%
			totalDebt: '3000000000000000000000000' // 3M BOLD
		}
	]
};

const mockTrovesCountResponse: ActiveTrovesCountResponse = {
	coll0: [{ id: '1' }, { id: '2' }, { id: '3' }], // 3 ETH troves
	coll1: [{ id: '4' }, { id: '5' }], // 2 WSTETH troves
	coll2: [{ id: '6' }] // 1 RETH trove
};

const mockCollateralsResponse: CollateralsResponse = {
	collaterals: [
		{ id: '0', collIndex: 0, minCollRatio: '1100000000000000000' }, // 110%
		{ id: '1', collIndex: 1, minCollRatio: '1200000000000000000' }, // 120%
		{ id: '2', collIndex: 2, minCollRatio: '1200000000000000000' } // 120%
	]
};

describe('ProtocolStatsStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		protocolStats.clear();
	});

	afterEach(() => {
		protocolStats.clear();
	});

	describe('initialization', () => {
		it('starts with empty state', () => {
			expect(protocolStats.stats).toBe(null);
			expect(protocolStats.loading).toBe(false);
			expect(protocolStats.error).toBe(null);
			expect(protocolStats.lastUpdated).toBe(null);
		});

		it('formattedTotalDebt is null initially', () => {
			expect(protocolStats.formattedTotalDebt).toBe(null);
		});
	});

	describe('fetchStats', () => {
		it('fetches all stats data in parallel', async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();

			expect(graphqlClient.request).toHaveBeenCalledTimes(3);
			expect(protocolStats.loading).toBe(false);
			expect(protocolStats.lastUpdated).toBeInstanceOf(Date);
			expect(protocolStats.stats).not.toBe(null);
		});

		it('sets loading state during fetch', async () => {
			let resolveRequest: (value: unknown) => void;
			const promise = new Promise((resolve) => {
				resolveRequest = resolve;
			});
			vi.mocked(graphqlClient.request).mockReturnValue(promise as Promise<unknown>);

			const fetchPromise = protocolStats.fetchStats();
			expect(protocolStats.loading).toBe(true);

			resolveRequest!(mockBracketsResponse);
			await fetchPromise.catch(() => {}); // Ignore error from incomplete mocks
		});

		it('handles fetch errors gracefully', async () => {
			const error = new Error('Network error');
			vi.mocked(graphqlClient.request).mockRejectedValueOnce(error);

			await protocolStats.fetchStats();

			expect(protocolStats.error).toEqual(error);
			expect(protocolStats.loading).toBe(false);
			expect(protocolStats.stats).toBe(null);
		});
	});

	describe('computed stats', () => {
		beforeEach(async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();
		});

		it('calculates total debt across all branches', () => {
			// ETH: 10M + 5M = 15M, WSTETH: 8M, RETH: 3M = 26M total
			const totalDebt = protocolStats.stats?.totalDebt;
			expect(totalDebt).toBe(BigInt('26000000000000000000000000'));
		});

		it('calculates total active troves', () => {
			expect(protocolStats.stats?.totalActiveTroves).toBe(6);
		});

		it('provides branch-level stats', () => {
			const branches = protocolStats.stats?.branches;
			expect(branches).toHaveLength(3);

			// ETH branch
			expect(branches?.[0].collateralSymbol).toBe('ETH');
			expect(branches?.[0].totalDebt).toBe(BigInt('15000000000000000000000000'));
			expect(branches?.[0].activeTroves).toBe(3);
			expect(branches?.[0].minCollRatio).toBe(110);

			// WSTETH branch
			expect(branches?.[1].collateralSymbol).toBe('WSTETH');
			expect(branches?.[1].totalDebt).toBe(BigInt('8000000000000000000000000'));
			expect(branches?.[1].activeTroves).toBe(2);
			expect(branches?.[1].minCollRatio).toBe(120);

			// RETH branch
			expect(branches?.[2].collateralSymbol).toBe('RETH');
			expect(branches?.[2].totalDebt).toBe(BigInt('3000000000000000000000000'));
			expect(branches?.[2].activeTroves).toBe(1);
		});
	});

	describe('formattedTotalDebt', () => {
		it('formats millions correctly', async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();

			expect(protocolStats.formattedTotalDebt).toBe('26.00M');
		});

		it('formats thousands correctly', async () => {
			const smallBracketsResponse: InterestRateBracketsResponse = {
				interestRateBrackets: [
					{
						collateral: { collIndex: 0 },
						rate: '50000000000000000',
						totalDebt: '500000000000000000000000' // 500K BOLD
					}
				]
			};

			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(smallBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();

			expect(protocolStats.formattedTotalDebt).toBe('500.00K');
		});
	});

	describe('getBranchStats', () => {
		beforeEach(async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();
		});

		it('returns stats for valid collateral symbol', () => {
			const ethStats = protocolStats.getBranchStats('ETH');
			expect(ethStats).toBeDefined();
			expect(ethStats?.collateralSymbol).toBe('ETH');
			expect(ethStats?.activeTroves).toBe(3);
		});

		it('returns undefined for invalid collateral symbol', () => {
			expect(protocolStats.getBranchStats('INVALID')).toBeUndefined();
		});
	});

	describe('getFormattedBranchDebt', () => {
		beforeEach(async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();
		});

		it('formats branch debt in millions', () => {
			expect(protocolStats.getFormattedBranchDebt('ETH')).toBe('15.0M');
			expect(protocolStats.getFormattedBranchDebt('WSTETH')).toBe('8.0M');
			expect(protocolStats.getFormattedBranchDebt('RETH')).toBe('3.0M');
		});

		it('returns dash for invalid collateral', () => {
			expect(protocolStats.getFormattedBranchDebt('INVALID')).toBe('-');
		});
	});

	describe('clear', () => {
		it('resets all state', async () => {
			vi.mocked(graphqlClient.request)
				.mockResolvedValueOnce(mockBracketsResponse)
				.mockResolvedValueOnce(mockTrovesCountResponse)
				.mockResolvedValueOnce(mockCollateralsResponse);

			await protocolStats.fetchStats();
			expect(protocolStats.stats).not.toBe(null);

			protocolStats.clear();

			expect(protocolStats.stats).toBe(null);
			expect(protocolStats.error).toBe(null);
			expect(protocolStats.lastUpdated).toBe(null);
		});
	});
});
