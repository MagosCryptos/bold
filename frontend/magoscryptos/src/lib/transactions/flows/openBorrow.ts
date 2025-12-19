// Open Borrow Position (Open Trove) flow

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';
import { getTroveOperationHints } from '../hints';
import { needsCollateralApproval, approveCollateralForBorrowing } from '../approvals';
import type { OpenBorrowRequest, TxStepDefinition } from '../types';
import type { Address } from '$lib/types';

// ETH gas compensation required when opening a trove (0.0375 ETH)
const ETH_GAS_COMPENSATION = 37500000000000000n; // 0.0375 * 1e18

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for opening a borrow position
 */
export async function getOpenBorrowSteps(request: OpenBorrowRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	// For ETH (branchId 0), we use the Zapper which accepts raw ETH
	// For LSTs (branchId 1, 2), we need approval first
	if (request.branchId !== 0) {
		// Check if approval is needed
		const needsApproval = await needsCollateralApproval(
			request.branchId,
			request.account,
			request.collateralAmount
		);

		if (needsApproval) {
			steps.push({
				id: 'approve',
				label: `Approve ${collSymbol}`,
				execute: async () => {
					return approveCollateralForBorrowing(request.branchId, request.collateralAmount);
				}
			});
		}
	}

	// Open trove step
	steps.push({
		id: 'openTrove',
		label: 'Open Position',
		execute: async () => {
			return executeOpenTrove(request);
		}
	});

	return steps;
}

/**
 * Execute the open trove transaction
 */
async function executeOpenTrove(request: OpenBorrowRequest): Promise<`0x${string}`> {
	// Get hints for sorted trove insertion
	const { upperHint, lowerHint } = await getTroveOperationHints(
		request.branchId,
		request.interestRate
	);

	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');

	// For ETH branch, use LeverageWETHZapper
	// For LST branches, use the standard BorrowerOperations
	if (request.branchId === 0) {
		// ETH branch - use Zapper with raw ETH
		const zapper = getBranchContract(request.branchId, 'LeverageZapper');

		return writeContract(wagmiConfig, {
			...zapper,
			functionName: 'openTroveWithRawETH',
			args: [
				{
					owner: request.account,
					ownerIndex: 0n, // First trove for this owner
					collAmount: 0n, // Collateral sent as value
					boldAmount: request.borrowAmount,
					upperHint,
					lowerHint,
					annualInterestRate: request.interestRate,
					batchManager: '0x0000000000000000000000000000000000000000' as Address,
					maxUpfrontFee: request.maxUpfrontFee,
					addManager: '0x0000000000000000000000000000000000000000' as Address,
					removeManager: '0x0000000000000000000000000000000000000000' as Address,
					receiver: '0x0000000000000000000000000000000000000000' as Address
				}
			],
			value: request.collateralAmount + ETH_GAS_COMPENSATION
		});
	} else {
		// LST branch - use standard BorrowerOperations
		return writeContract(wagmiConfig, {
			...borrowerOps,
			functionName: 'openTrove',
			args: [
				request.account, // owner
				0n, // ownerIndex
				request.collateralAmount, // collAmount
				request.borrowAmount, // boldAmount
				upperHint,
				lowerHint,
				request.interestRate, // annualInterestRate
				request.maxUpfrontFee, // maxUpfrontFee
				'0x0000000000000000000000000000000000000000' as Address, // addManager
				'0x0000000000000000000000000000000000000000' as Address, // removeManager
				'0x0000000000000000000000000000000000000000' as Address // receiver
			],
			value: ETH_GAS_COMPENSATION
		});
	}
}

/**
 * Get flow definition for opening a borrow position
 */
export function getOpenBorrowFlowDefinition(request: OpenBorrowRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Open Borrow Position',
		getSteps: () => getOpenBorrowSteps(request),
		getSuccessMessage: () => `Successfully opened a ${collSymbol} borrow position`,
		getBackLink: () => ({ path: `/borrow/${collSymbol.toLowerCase()}`, label: 'Back to Borrow' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
