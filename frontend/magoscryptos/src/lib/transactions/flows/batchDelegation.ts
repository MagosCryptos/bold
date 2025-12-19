// Batch delegation flows (join, leave, switch batch managers)

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getBranch } from '$lib/web3';
import { getTroveOperationHints } from '../hints';
import type { SetBatchManagerRequest, RemoveFromBatchRequest, TxStepDefinition } from '../types';

// ============================================
// Set Batch Manager Flow (Join a batch)
// ============================================

/**
 * Build steps for joining a batch manager
 */
export async function getSetBatchManagerSteps(
	request: SetBatchManagerRequest
): Promise<TxStepDefinition[]> {
	return [
		{
			id: 'setBatchManager',
			label: 'Set Interest Rate Delegate',
			execute: async () => executeSetBatchManager(request)
		}
	];
}

/**
 * Execute set batch manager transaction
 */
async function executeSetBatchManager(request: SetBatchManagerRequest): Promise<`0x${string}`> {
	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');

	// Get hints for the batch manager's interest rate
	const { upperHint, lowerHint } = await getTroveOperationHints(
		request.branchId,
		request.minInterestRate // Use min rate for hints
	);

	return writeContract(wagmiConfig, {
		...borrowerOps,
		functionName: 'setInterestBatchManager',
		args: [
			BigInt(request.troveId),
			request.batchManager,
			upperHint,
			lowerHint,
			request.minInterestRate,
			request.maxInterestRate,
			request.minInterestRateChangePeriod,
			0n // maxUpfrontFee - use 0 for setting batch manager
		]
	});
}

/**
 * Get flow definition for setting batch manager
 */
export function getSetBatchManagerFlowDefinition(request: SetBatchManagerRequest) {
	const branch = getBranch(request.branchId);

	return {
		title: 'Set Interest Rate Delegate',
		getSteps: () => getSetBatchManagerSteps(request),
		getSuccessMessage: () => `Successfully delegated interest rate management for ${branch.symbol} position`,
		getBackLink: () => ({ path: '/loan', label: 'Back to Position' }),
		getSuccessLink: () => ({ path: '/loan', label: 'View Position' })
	};
}

// ============================================
// Remove From Batch Flow (Leave a batch)
// ============================================

/**
 * Build steps for leaving a batch manager
 */
export async function getRemoveFromBatchSteps(
	request: RemoveFromBatchRequest
): Promise<TxStepDefinition[]> {
	return [
		{
			id: 'removeFromBatch',
			label: 'Remove Interest Rate Delegate',
			execute: async () => executeRemoveFromBatch(request)
		}
	];
}

/**
 * Execute remove from batch transaction
 */
async function executeRemoveFromBatch(request: RemoveFromBatchRequest): Promise<`0x${string}`> {
	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');

	// Get hints for the new interest rate
	const { upperHint, lowerHint } = await getTroveOperationHints(
		request.branchId,
		request.newInterestRate
	);

	return writeContract(wagmiConfig, {
		...borrowerOps,
		functionName: 'removeFromBatch',
		args: [
			BigInt(request.troveId),
			request.newInterestRate,
			upperHint,
			lowerHint,
			0n // maxUpfrontFee
		]
	});
}

/**
 * Get flow definition for removing from batch
 */
export function getRemoveFromBatchFlowDefinition(request: RemoveFromBatchRequest) {
	const branch = getBranch(request.branchId);

	return {
		title: 'Remove Interest Rate Delegate',
		getSteps: () => getRemoveFromBatchSteps(request),
		getSuccessMessage: () => `Successfully removed delegate for ${branch.symbol} position`,
		getBackLink: () => ({ path: '/loan', label: 'Back to Position' }),
		getSuccessLink: () => ({ path: '/loan', label: 'View Position' })
	};
}
