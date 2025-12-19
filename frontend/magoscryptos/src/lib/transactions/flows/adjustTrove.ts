// Adjust Trove flow - modify collateral and/or debt

import { writeContract, readContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';
import { getTroveOperationHints } from '../hints';
import { needsCollateralApproval, approveCollateralForBorrowing, needsBoldApproval, approveBoldForRepayment } from '../approvals';
import type { AdjustTroveRequest, TxStepDefinition } from '../types';
import type { Address } from '$lib/types';

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Build steps for adjusting a trove
 */
export async function getAdjustTroveSteps(request: AdjustTroveRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';
	const isAddingCollateral = request.collateralChange > 0n;
	const isRepayingDebt = request.debtChange < 0n;

	// For LST branches, check if approval is needed when adding collateral
	if (request.branchId !== 0 && isAddingCollateral) {
		const needsApproval = await needsCollateralApproval(
			request.branchId,
			request.account,
			request.collateralChange
		);

		if (needsApproval) {
			steps.push({
				id: 'approveCollateral',
				label: `Approve ${collSymbol}`,
				execute: async () => {
					return approveCollateralForBorrowing(request.branchId, request.collateralChange);
				}
			});
		}
	}

	// If repaying debt, check if BOLD approval is needed
	if (isRepayingDebt) {
		const repayAmount = -request.debtChange; // Convert negative to positive
		const needsApproval = await needsBoldApproval(
			request.branchId,
			request.account,
			repayAmount
		);

		if (needsApproval) {
			steps.push({
				id: 'approveBold',
				label: 'Approve BOLD',
				execute: async () => {
					return approveBoldForRepayment(request.branchId, repayAmount);
				}
			});
		}
	}

	// Adjust trove step
	steps.push({
		id: 'adjustTrove',
		label: getAdjustLabel(request),
		execute: async () => {
			return executeAdjustTrove(request);
		}
	});

	return steps;
}

/**
 * Get a human-readable label for the adjust operation
 */
function getAdjustLabel(request: AdjustTroveRequest): string {
	const isAddingCollateral = request.collateralChange > 0n;
	const isWithdrawingCollateral = request.collateralChange < 0n;
	const isBorrowing = request.debtChange > 0n;
	const isRepaying = request.debtChange < 0n;

	if (isAddingCollateral && isBorrowing) return 'Deposit & Borrow';
	if (isAddingCollateral && isRepaying) return 'Deposit & Repay';
	if (isWithdrawingCollateral && isBorrowing) return 'Withdraw & Borrow';
	if (isWithdrawingCollateral && isRepaying) return 'Withdraw & Repay';
	if (isAddingCollateral) return 'Deposit Collateral';
	if (isWithdrawingCollateral) return 'Withdraw Collateral';
	if (isBorrowing) return 'Borrow More';
	if (isRepaying) return 'Repay Debt';
	return 'Adjust Position';
}

/**
 * Execute the adjust trove transaction
 */
async function executeAdjustTrove(request: AdjustTroveRequest): Promise<`0x${string}`> {
	const borrowerOps = getBranchContract(request.branchId, 'BorrowerOperations');

	// Get current interest rate for hints
	const troveManager = getBranchContract(request.branchId, 'TroveManager');
	const troveIdBn = BigInt(request.troveId);

	// Get the trove's current interest rate
	const troveData = await readContract(wagmiConfig, {
		...troveManager,
		functionName: 'Troves',
		args: [troveIdBn]
	}) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

	const annualInterestRate = troveData[5]; // Interest rate is at index 5
	const { upperHint, lowerHint } = await getTroveOperationHints(request.branchId, annualInterestRate);

	const isCollIncrease = request.collateralChange > 0n;
	const isDebtIncrease = request.debtChange > 0n;
	const collChange = isCollIncrease ? request.collateralChange : -request.collateralChange;
	const debtChange = isDebtIncrease ? request.debtChange : -request.debtChange;

	// For ETH branch, use Zapper if adding ETH
	if (request.branchId === 0 && isCollIncrease) {
		const zapper = getBranchContract(request.branchId, 'LeverageZapper');

		return writeContract(wagmiConfig, {
			...zapper,
			functionName: 'adjustTroveWithRawETH',
			args: [
				troveIdBn,
				collChange,
				isCollIncrease,
				debtChange,
				isDebtIncrease,
				upperHint,
				lowerHint,
				request.maxUpfrontFee
			],
			value: collChange
		});
	}

	// Standard adjustment through BorrowerOperations
	return writeContract(wagmiConfig, {
		...borrowerOps,
		functionName: 'adjustTrove',
		args: [
			troveIdBn,
			collChange,
			isCollIncrease,
			debtChange,
			isDebtIncrease,
			upperHint,
			lowerHint,
			request.maxUpfrontFee
		]
	});
}

/**
 * Get flow definition for adjusting a trove
 */
export function getAdjustTroveFlowDefinition(request: AdjustTroveRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Adjust Position',
		getSteps: () => getAdjustTroveSteps(request),
		getSuccessMessage: () => `Successfully adjusted your ${collSymbol} position`,
		getBackLink: () => ({ path: '/loan', label: 'Back to Loan' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
