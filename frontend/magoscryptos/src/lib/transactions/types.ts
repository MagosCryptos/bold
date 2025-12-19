// Transaction flow types for Web3 operations

import type { Address } from '$lib/types';

// Step status in a transaction flow
export type TxStepStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

// Individual step in a transaction flow
export interface TxStep {
	id: string;
	label: string;
	status: TxStepStatus;
	txHash?: `0x${string}`;
	error?: {
		name: string;
		message: string;
	};
}

// Overall flow status
export type TxFlowStatus = 'idle' | 'pending' | 'success' | 'error';

// Transaction flow state
export interface TxFlowState {
	id: string;
	title: string;
	steps: TxStep[];
	currentStepIndex: number;
	status: TxFlowStatus;
	error?: string;
	successMessage?: string;
	backLink?: { path: string; label: string };
	successLink?: { path: string; label: string };
}

// Flow request types for different operations
export interface BaseTxRequest {
	flowId: string;
	account: Address;
}

// Open borrow position (new trove)
export interface OpenBorrowRequest extends BaseTxRequest {
	flowId: 'openBorrow';
	branchId: number;
	collateralAmount: bigint;
	borrowAmount: bigint;
	interestRate: bigint;
	maxUpfrontFee: bigint;
}

// Adjust existing trove
export interface AdjustTroveRequest extends BaseTxRequest {
	flowId: 'adjustTrove';
	branchId: number;
	troveId: string;
	collateralChange: bigint; // positive = deposit, negative = withdraw
	debtChange: bigint; // positive = borrow more, negative = repay
	maxUpfrontFee: bigint;
}

// Close trove
export interface CloseTroveRequest extends BaseTxRequest {
	flowId: 'closeTrove';
	branchId: number;
	troveId: string;
}

// Deposit to stability pool
export interface EarnDepositRequest extends BaseTxRequest {
	flowId: 'earnDeposit';
	branchId: number;
	amount: bigint;
}

// Withdraw from stability pool
export interface EarnWithdrawRequest extends BaseTxRequest {
	flowId: 'earnWithdraw';
	branchId: number;
	amount: bigint;
	claimRewards: boolean;
}

// Claim stability pool rewards
export interface EarnClaimRequest extends BaseTxRequest {
	flowId: 'earnClaim';
	branchId: number;
}

// Stake LQTY
export interface StakeLqtyRequest extends BaseTxRequest {
	flowId: 'stakeLqty';
	amount: bigint;
}

// Unstake LQTY
export interface UnstakeLqtyRequest extends BaseTxRequest {
	flowId: 'unstakeLqty';
	amount: bigint;
}

// Claim staking rewards
export interface ClaimStakingRewardsRequest extends BaseTxRequest {
	flowId: 'claimStakingRewards';
}

// Redeem BOLD for collateral
export interface RedeemBoldRequest extends BaseTxRequest {
	flowId: 'redeemBold';
	amount: bigint;
	maxIterationsPerCollateral: number;
}

// Adjust interest rate
export interface AdjustInterestRateRequest extends BaseTxRequest {
	flowId: 'adjustInterestRate';
	branchId: number;
	troveId: string;
	newInterestRate: bigint;
	maxUpfrontFee: bigint;
}

// Union of all request types
export type TxRequest =
	| OpenBorrowRequest
	| AdjustTroveRequest
	| CloseTroveRequest
	| EarnDepositRequest
	| EarnWithdrawRequest
	| EarnClaimRequest
	| StakeLqtyRequest
	| UnstakeLqtyRequest
	| ClaimStakingRewardsRequest
	| RedeemBoldRequest
	| AdjustInterestRateRequest;

// Step definition for building flows
export interface TxStepDefinition {
	id: string;
	label: string;
	// Execute the step, returns tx hash on success
	execute: () => Promise<`0x${string}`>;
	// Optional: check if step should be skipped
	shouldSkip?: () => Promise<boolean>;
}

// Flow definition
export interface TxFlowDefinition<T extends TxRequest = TxRequest> {
	id: string;
	title: string;
	// Build steps based on request
	getSteps: (request: T) => Promise<TxStepDefinition[]>;
	// Success message
	getSuccessMessage: (request: T) => string;
	// Links
	getBackLink?: (request: T) => { path: string; label: string };
	getSuccessLink?: (request: T) => { path: string; label: string };
}

// Gas settings
export const GAS_HEADROOM = 50000n; // Extra gas buffer
export const GAS_HEADROOM_PERCENT = 20n; // 20% extra gas
