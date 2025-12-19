// Earn Deposit (Stability Pool deposit) flow

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';
import { needsBoldApprovalForStabilityPool, approveBoldForStabilityPool } from '../approvals';
import type { EarnDepositRequest, TxStepDefinition } from '../types';

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for depositing to stability pool
 */
export async function getEarnDepositSteps(request: EarnDepositRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];

	// Check if BOLD approval is needed
	const needsApproval = await needsBoldApprovalForStabilityPool(
		request.branchId,
		request.account,
		request.amount
	);

	if (needsApproval) {
		steps.push({
			id: 'approve',
			label: 'Approve BOLD',
			execute: async () => {
				return approveBoldForStabilityPool(request.branchId, request.amount);
			}
		});
	}

	// Deposit step
	steps.push({
		id: 'deposit',
		label: 'Deposit to Stability Pool',
		execute: async () => {
			return executeDeposit(request);
		}
	});

	return steps;
}

/**
 * Execute the stability pool deposit
 */
async function executeDeposit(request: EarnDepositRequest): Promise<`0x${string}`> {
	const stabilityPool = getBranchContract(request.branchId, 'StabilityPool');

	return writeContract(wagmiConfig, {
		...stabilityPool,
		functionName: 'provideToSP',
		args: [request.amount, false] // doClaim = false (don't claim rewards yet)
	});
}

/**
 * Get flow definition for earn deposit
 */
export function getEarnDepositFlowDefinition(request: EarnDepositRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Pool';

	return {
		title: 'Deposit to Stability Pool',
		getSteps: () => getEarnDepositSteps(request),
		getSuccessMessage: () => `Successfully deposited BOLD to ${collSymbol} Stability Pool`,
		getBackLink: () => ({ path: `/earn/${collSymbol.toLowerCase()}`, label: 'Back to Earn' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
