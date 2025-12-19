// Close Trove flow - repay all debt and withdraw collateral

import { writeContract, readContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';
import { needsBoldApproval, approveBoldForRepayment } from '../approvals';
import type { CloseTroveRequest, TxStepDefinition } from '../types';
import type { Address } from '$lib/types';

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for closing a trove
 */
export async function getCloseTroveSteps(request: CloseTroveRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];

	// Get the current debt to approve
	const troveManager = getBranchContract(request.branchId, 'TroveManager');
	const troveIdBn = BigInt(request.troveId);

	const troveData = await readContract(wagmiConfig, {
		...troveManager,
		functionName: 'Troves',
		args: [troveIdBn]
	}) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

	const debt = troveData[0]; // Debt is at index 0

	// Check if BOLD approval is needed for repayment
	const needsApproval = await needsBoldApproval(
		request.branchId,
		request.account,
		debt
	);

	if (needsApproval) {
		steps.push({
			id: 'approveBold',
			label: 'Approve BOLD',
			execute: async () => {
				return approveBoldForRepayment(request.branchId, debt);
			}
		});
	}

	// Close trove step
	steps.push({
		id: 'closeTrove',
		label: 'Close Position',
		execute: async () => {
			return executeCloseTrove(request);
		}
	});

	return steps;
}

/**
 * Execute the close trove transaction
 */
async function executeCloseTrove(request: CloseTroveRequest): Promise<`0x${string}`> {
	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');
	const troveIdBn = BigInt(request.troveId);

	// For ETH branch, use Zapper to receive raw ETH
	if (request.branchId === 0) {
		const zapper = getBranchContract(request.branchId, 'LeverageZapper');

		return writeContract(wagmiConfig, {
			...zapper,
			functionName: 'closeTroveToRawETH',
			args: [troveIdBn]
		});
	}

	// Standard close through BorrowerOperations
	return writeContract(wagmiConfig, {
		...borrowerOps,
		functionName: 'closeTrove',
		args: [troveIdBn]
	});
}

/**
 * Get flow definition for closing a trove
 */
export function getCloseTroveFlowDefinition(request: CloseTroveRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Close Position',
		getSteps: () => getCloseTroveSteps(request),
		getSuccessMessage: () => `Successfully closed your ${collSymbol} position`,
		getBackLink: () => ({ path: '/loan', label: 'Back to Loan' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
