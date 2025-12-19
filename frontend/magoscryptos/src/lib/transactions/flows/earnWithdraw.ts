// Earn Withdraw (Stability Pool withdraw) flow

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract } from '$lib/web3';
import type { EarnWithdrawRequest, EarnClaimRequest, TxStepDefinition } from '../types';

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for withdrawing from stability pool
 */
export async function getEarnWithdrawSteps(request: EarnWithdrawRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];

	// Single step: withdraw (optionally claiming rewards)
	steps.push({
		id: 'withdraw',
		label: request.claimRewards ? 'Withdraw & Claim Rewards' : 'Withdraw from Stability Pool',
		execute: async () => {
			return executeWithdraw(request);
		}
	});

	return steps;
}

/**
 * Execute the stability pool withdrawal
 */
async function executeWithdraw(request: EarnWithdrawRequest): Promise<`0x${string}`> {
	const stabilityPool = getBranchContract(request.branchId, 'StabilityPool');

	return writeContract(wagmiConfig, {
		...stabilityPool,
		functionName: 'withdrawFromSP',
		args: [request.amount, request.claimRewards]
	});
}

/**
 * Get flow definition for earn withdraw
 */
export function getEarnWithdrawFlowDefinition(request: EarnWithdrawRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Pool';

	return {
		title: 'Withdraw from Stability Pool',
		getSteps: () => getEarnWithdrawSteps(request),
		getSuccessMessage: () =>
			request.claimRewards
				? `Successfully withdrew BOLD and claimed ${collSymbol} rewards`
				: `Successfully withdrew BOLD from ${collSymbol} Stability Pool`,
		getBackLink: () => ({ path: `/earn/${collSymbol.toLowerCase()}`, label: 'Back to Earn' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}

/**
 * Build steps for claiming stability pool rewards only
 */
export async function getEarnClaimSteps(request: EarnClaimRequest): Promise<TxStepDefinition[]> {
	return [
		{
			id: 'claim',
			label: 'Claim Rewards',
			execute: async () => {
				return executeClaim(request);
			}
		}
	];
}

/**
 * Execute the claim rewards transaction
 */
async function executeClaim(request: EarnClaimRequest): Promise<`0x${string}`> {
	const stabilityPool = getBranchContract(request.branchId, 'StabilityPool');

	// Withdraw 0 BOLD with claim = true to just claim rewards
	return writeContract(wagmiConfig, {
		...stabilityPool,
		functionName: 'withdrawFromSP',
		args: [0n, true]
	});
}

/**
 * Get flow definition for claiming rewards
 */
export function getEarnClaimFlowDefinition(request: EarnClaimRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Pool';

	return {
		title: 'Claim Stability Pool Rewards',
		getSteps: () => getEarnClaimSteps(request),
		getSuccessMessage: () => `Successfully claimed ${collSymbol} rewards`,
		getBackLink: () => ({ path: `/earn/${collSymbol.toLowerCase()}`, label: 'Back to Earn' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
