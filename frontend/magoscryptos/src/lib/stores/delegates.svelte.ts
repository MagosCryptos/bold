// Delegates store for batch delegation management
import { readContract, readContracts } from '@wagmi/core';
import type { Address, BranchId, Delegate, CollateralSymbol } from '$lib/types';
import { wagmiConfig, getBranchContract, KNOWN_DELEGATES_URL, getBranch } from '$lib/web3';
import { graphqlClient, INTEREST_BATCHES } from '$lib/graphql';
import type { InterestBatchesResponse } from '$lib/graphql/types';

// Schema for known delegates from external URL
export interface KnownDelegateStrategy {
	name: string;
	address: string;
	branches: string[]; // Collateral symbols like "ETH", "WSTETH"
	hide?: boolean;
}

export interface KnownDelegateGroup {
	name: string;
	url: string;
	strategies: KnownDelegateStrategy[];
}

export type KnownDelegates = KnownDelegateGroup[];

// Helper to shorten address for display
function shortenAddress(address: string, chars = 4): string {
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

class DelegatesStore {
	// Known delegates from external URL
	knownDelegates = $state<KnownDelegates | null>(null);
	knownDelegatesLoading = $state(false);
	knownDelegatesError = $state<string | null>(null);

	// Cached delegate data by branch and address
	private delegateCache = $state<Map<string, Delegate>>(new Map());

	constructor() {
		// Fetch known delegates on init if URL is configured
		if (KNOWN_DELEGATES_URL) {
			this.fetchKnownDelegates();
		}
	}

	/**
	 * Fetch known delegates from external URL
	 */
	async fetchKnownDelegates(): Promise<void> {
		if (!KNOWN_DELEGATES_URL) {
			this.knownDelegates = null;
			return;
		}

		this.knownDelegatesLoading = true;
		this.knownDelegatesError = null;

		try {
			const response = await fetch(KNOWN_DELEGATES_URL);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const data = await response.json();
			this.knownDelegates = data as KnownDelegates;
		} catch (error) {
			this.knownDelegatesError = error instanceof Error ? error.message : 'Failed to fetch';
			this.knownDelegates = null;
		} finally {
			this.knownDelegatesLoading = false;
		}
	}

	/**
	 * Get known delegates filtered by branch
	 */
	getKnownDelegatesForBranch(branchId: BranchId): Array<{
		groupName: string;
		groupUrl: string;
		strategy: KnownDelegateStrategy;
	}> {
		if (!this.knownDelegates) return [];

		const branch = getBranch(branchId);
		const branchSymbol = branch.symbol.toLowerCase();
		const results: Array<{
			groupName: string;
			groupUrl: string;
			strategy: KnownDelegateStrategy;
		}> = [];

		for (const group of this.knownDelegates) {
			for (const strategy of group.strategies) {
				if (
					!strategy.hide &&
					strategy.branches.some((b) => b.toLowerCase() === branchSymbol)
				) {
					results.push({
						groupName: group.name,
						groupUrl: group.url,
						strategy
					});
				}
			}
		}

		return results;
	}

	/**
	 * Get display name for a delegate address
	 */
	getDelegateDisplayName(address: Address): string | undefined {
		if (!this.knownDelegates) return undefined;

		for (const group of this.knownDelegates) {
			const strategy = group.strategies.find(
				(s) => s.address.toLowerCase() === address.toLowerCase()
			);
			if (strategy) {
				return strategy.name ? `${group.name} - ${strategy.name}` : group.name;
			}
		}
		return undefined;
	}

	/**
	 * Fetch batch delegate data from subgraph
	 */
	private async fetchBatchesFromSubgraph(
		branchId: BranchId,
		addresses: Address[]
	): Promise<
		Array<{
			batchManager: Address;
			debt: bigint;
			coll: bigint;
			interestRate: bigint;
			fee: bigint;
		}>
	> {
		const ids = addresses.map((addr) => `${branchId}:${addr.toLowerCase()}`);

		try {
			const response = await graphqlClient.request<InterestBatchesResponse>(INTEREST_BATCHES, {
				ids
			});

			return response.interestBatches.map((batch) => ({
				batchManager: batch.batchManager as Address,
				debt: BigInt(batch.debt),
				coll: BigInt(batch.coll),
				interestRate: BigInt(batch.annualInterestRate),
				fee: BigInt(batch.annualManagementFee)
			}));
		} catch {
			// Fallback to RPC if subgraph fails
			return this.fetchBatchesFromRPC(branchId, addresses);
		}
	}

	/**
	 * Fetch batch data from RPC (fallback)
	 */
	private async fetchBatchesFromRPC(
		branchId: BranchId,
		addresses: Address[]
	): Promise<
		Array<{
			batchManager: Address;
			debt: bigint;
			coll: bigint;
			interestRate: bigint;
			fee: bigint;
		}>
	> {
		const troveManager = getBranchContract(branchId, 'TroveManager');

		const results = await readContracts(wagmiConfig, {
			allowFailure: true,
			contracts: addresses.map((address) => ({
				...troveManager,
				functionName: 'getLatestBatchData' as const,
				args: [address]
			}))
		});

		return addresses
			.map((address, index) => {
				const result = results[index];
				if (result.status !== 'success' || !result.result) return null;

				const data = result.result as {
					recordedDebt: bigint;
					entireCollWithoutRedistribution: bigint;
					annualInterestRate: bigint;
					annualManagementFee: bigint;
				};

				return {
					batchManager: address,
					debt: data.recordedDebt,
					coll: data.entireCollWithoutRedistribution,
					interestRate: data.annualInterestRate,
					fee: data.annualManagementFee
				};
			})
			.filter((x): x is NonNullable<typeof x> => x !== null);
	}

	/**
	 * Fetch batch manager constraints from chain
	 */
	private async fetchBatchManagerConstraints(
		branchId: BranchId,
		addresses: Address[]
	): Promise<
		Map<
			string,
			{
				minInterestRate: bigint;
				maxInterestRate: bigint;
				minInterestRateChangePeriod: bigint;
			}
		>
	> {
		const borrowerOps = getBranchContract(branchId, 'BorrowerOperations');

		const results = await readContracts(wagmiConfig, {
			allowFailure: true,
			contracts: addresses.map((address) => ({
				...borrowerOps,
				functionName: 'getInterestBatchManager' as const,
				args: [address]
			}))
		});

		const constraints = new Map<
			string,
			{
				minInterestRate: bigint;
				maxInterestRate: bigint;
				minInterestRateChangePeriod: bigint;
			}
		>();

		addresses.forEach((address, index) => {
			const result = results[index];
			if (result.status === 'success' && result.result) {
				const data = result.result as {
					minInterestRate: bigint;
					maxInterestRate: bigint;
					minInterestRateChangePeriod: bigint;
				};
				constraints.set(address.toLowerCase(), {
					minInterestRate: data.minInterestRate,
					maxInterestRate: data.maxInterestRate,
					minInterestRateChangePeriod: data.minInterestRateChangePeriod
				});
			}
		});

		return constraints;
	}

	/**
	 * Fetch delegates by addresses for a branch
	 */
	async fetchDelegates(branchId: BranchId, addresses: Address[]): Promise<Delegate[]> {
		if (addresses.length === 0) return [];

		// Fetch batch data and constraints in parallel
		const [batches, constraints] = await Promise.all([
			this.fetchBatchesFromSubgraph(branchId, addresses),
			this.fetchBatchManagerConstraints(branchId, addresses)
		]);

		const delegates: Delegate[] = [];

		for (const batch of batches) {
			const addr = batch.batchManager.toLowerCase() as Address;
			const constraint = constraints.get(addr);

			if (!constraint) continue;

			const delegate: Delegate = {
				id: `${branchId}:${addr}`,
				address: addr,
				name: this.getDelegateDisplayName(addr) ?? shortenAddress(addr),
				interestRate: batch.interestRate,
				fee: Number(batch.fee) / 1e18,
				boldAmount: batch.debt,
				constraints: {
					minInterestRate: constraint.minInterestRate,
					maxInterestRate: constraint.maxInterestRate,
					minInterestRateChangePeriod: constraint.minInterestRateChangePeriod
				}
			};

			// Cache the delegate
			this.delegateCache.set(delegate.id, delegate);
			delegates.push(delegate);
		}

		return delegates;
	}

	/**
	 * Fetch a single delegate
	 */
	async fetchDelegate(branchId: BranchId, address: Address): Promise<Delegate | null> {
		const delegates = await this.fetchDelegates(branchId, [address]);
		return delegates[0] ?? null;
	}

	/**
	 * Get cached delegate
	 */
	getCachedDelegate(branchId: BranchId, address: Address): Delegate | undefined {
		return this.delegateCache.get(`${branchId}:${address.toLowerCase()}`);
	}
}

export const delegates = new DelegatesStore();
