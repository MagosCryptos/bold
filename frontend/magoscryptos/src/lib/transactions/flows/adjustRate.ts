// Adjust Interest Rate flow

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract } from '$lib/web3';
import { getTroveOperationHints } from '../hints';
import type { AdjustInterestRateRequest, TxStepDefinition } from '../types';

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for adjusting interest rate
 */
export async function getAdjustInterestRateSteps(
	request: AdjustInterestRateRequest
): Promise<TxStepDefinition[]> {
	return [
		{
			id: 'adjustRate',
			label: 'Update Interest Rate',
			execute: async () => {
				return executeAdjustRate(request);
			}
		}
	];
}

/**
 * Execute the interest rate adjustment
 */
async function executeAdjustRate(request: AdjustInterestRateRequest): Promise<`0x${string}`> {
	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');
	const troveIdBn = BigInt(request.troveId);

	// Get hints for the new interest rate position
	const { upperHint, lowerHint } = await getTroveOperationHints(
		request.branchId,
		request.newInterestRate
	);

	return writeContract(wagmiConfig, {
		...borrowerOps,
		functionName: 'adjustTroveInterestRate',
		args: [
			troveIdBn,
			request.newInterestRate,
			upperHint,
			lowerHint,
			request.maxUpfrontFee
		]
	});
}

/**
 * Get flow definition for adjusting interest rate
 */
export function getAdjustInterestRateFlowDefinition(request: AdjustInterestRateRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Update Interest Rate',
		getSteps: () => getAdjustInterestRateSteps(request),
		getSuccessMessage: () => `Successfully updated interest rate on your ${collSymbol} position`,
		getBackLink: () => ({ path: '/loan/rate', label: 'Back to Rate' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
