import type { Address } from 'viem';

export type { Address };

export type BranchId = 0 | 1 | 2;
export type CollateralSymbol = 'ETH' | 'WSTETH' | 'RETH';

export interface BranchContracts {
	ACTIVE_POOL: Address;
	BORROWER_OPERATIONS: Address;
	COLL_SURPLUS_POOL: Address;
	COLL_TOKEN: Address;
	DEFAULT_POOL: Address;
	LEVERAGE_ZAPPER: Address;
	PRICE_FEED: Address;
	SORTED_TROVES: Address;
	STABILITY_POOL: Address;
	TROVE_MANAGER: Address;
	TROVE_NFT: Address;
}

export interface Branch {
	id: BranchId;
	symbol: CollateralSymbol;
	name: string;
	contracts: BranchContracts;
}

export interface ProtocolContracts {
	BOLD_TOKEN: Address;
	COLLATERAL_REGISTRY: Address;
	EXCHANGE_HELPERS_V2: Address;
	GOVERNANCE: Address;
	HINT_HELPERS: Address;
	LQTY_STAKING: Address;
	LQTY_TOKEN: Address;
	MULTI_TROVE_GETTER: Address;
	REDEMPTION_HELPER: Address;
	WETH: Address;
}

export interface ChainConfig {
	id: number;
	name: string;
	rpcUrl: string;
	blockExplorer?: {
		name: string;
		url: string;
	};
	currency: {
		name: string;
		symbol: string;
		decimals: number;
	};
}

// Position types
export interface EarnPosition {
	branchId: BranchId;
	symbol: CollateralSymbol;
	deposit: bigint;
	collGain: bigint;
	yieldGain: bigint;
}

export interface LoanPosition {
	branchId: BranchId;
	symbol: CollateralSymbol;
	troveId: bigint;
	collateral: bigint;
	debt: bigint;
	interestRate: bigint;
}

export interface StakePosition {
	stakedLqty: bigint;
	unclaimedBold: bigint;
	unclaimedEth: bigint;
}

export interface PoolStats {
	branchId: BranchId;
	symbol: CollateralSymbol;
	totalDeposits: bigint;
	collBalance: bigint;
}
