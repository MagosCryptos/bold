import { erc20Abi } from 'viem';
import type { Address, BranchId, CollateralSymbol } from '$lib/types';
import { BRANCHES, getBranch, PROTOCOL_CONTRACTS } from './env';

// Import ABIs
import {
	ActivePool,
	BorrowerOperations,
	CollateralRegistry,
	Governance,
	HintHelpers,
	IExchangeHelpersV2,
	LeverageLSTZapper,
	LeverageWETHZapper,
	LqtyStaking,
	LqtyToken,
	MultiTroveGetter,
	PriceFeed,
	RedemptionHelper,
	SortedTroves,
	StabilityPool,
	TroveManager,
	TroveNFT
} from '$lib/abi';

// Branch contract ABIs
const branchAbis = {
	ActivePool,
	BorrowerOperations,
	LeverageLSTZapper,
	LeverageWETHZapper,
	PriceFeed,
	SortedTroves,
	StabilityPool,
	TroveManager,
	TroveNFT,
	CollToken: erc20Abi
} as const;

// Protocol contract ABIs
const protocolAbis = {
	BoldToken: erc20Abi,
	CollateralRegistry,
	ExchangeHelpersV2: IExchangeHelpersV2,
	Governance,
	HintHelpers,
	LqtyStaking,
	LqtyToken,
	MultiTroveGetter,
	RedemptionHelper,
	Weth: erc20Abi
} as const;

export type BranchContractName = keyof typeof branchAbis;
export type ProtocolContractName = keyof typeof protocolAbis;

// Contract type with abi and address
export type Contract<TAbi extends readonly unknown[]> = {
	abi: TAbi;
	address: Address;
};

/**
 * Get a branch-specific contract by branch ID/symbol and contract name
 */
export function getBranchContract<T extends BranchContractName>(
	branchIdOrSymbol: BranchId | CollateralSymbol,
	contractName: T
): Contract<(typeof branchAbis)[T]> {
	const branch = getBranch(branchIdOrSymbol);

	// Map contract names to branch contract keys
	const contractKeyMap: Record<BranchContractName, keyof typeof branch.contracts> = {
		ActivePool: 'ACTIVE_POOL',
		BorrowerOperations: 'BORROWER_OPERATIONS',
		LeverageLSTZapper: 'LEVERAGE_ZAPPER',
		LeverageWETHZapper: 'LEVERAGE_ZAPPER',
		PriceFeed: 'PRICE_FEED',
		SortedTroves: 'SORTED_TROVES',
		StabilityPool: 'STABILITY_POOL',
		TroveManager: 'TROVE_MANAGER',
		TroveNFT: 'TROVE_NFT',
		CollToken: 'COLL_TOKEN'
	};

	const contractKey = contractKeyMap[contractName];
	const address = branch.contracts[contractKey];

	if (!address) {
		throw new Error(`Contract ${contractName} not found for branch ${branchIdOrSymbol}`);
	}

	return {
		abi: branchAbis[contractName],
		address
	};
}

/**
 * Get a protocol-level contract by name
 */
export function getProtocolContract<T extends ProtocolContractName>(
	name: T
): Contract<(typeof protocolAbis)[T]> {
	// Map contract names to protocol contract keys
	const contractKeyMap: Record<ProtocolContractName, keyof typeof PROTOCOL_CONTRACTS> = {
		BoldToken: 'BOLD_TOKEN',
		CollateralRegistry: 'COLLATERAL_REGISTRY',
		ExchangeHelpersV2: 'EXCHANGE_HELPERS_V2',
		Governance: 'GOVERNANCE',
		HintHelpers: 'HINT_HELPERS',
		LqtyStaking: 'LQTY_STAKING',
		LqtyToken: 'LQTY_TOKEN',
		MultiTroveGetter: 'MULTI_TROVE_GETTER',
		RedemptionHelper: 'REDEMPTION_HELPER',
		Weth: 'WETH'
	};

	const contractKey = contractKeyMap[name];
	const address = PROTOCOL_CONTRACTS[contractKey];

	if (!address) {
		throw new Error(`Protocol contract ${name} not found`);
	}

	return {
		abi: protocolAbis[name],
		address
	};
}

// Re-export for convenience
export { BRANCHES, getBranch, PROTOCOL_CONTRACTS };
