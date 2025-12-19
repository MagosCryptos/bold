// Leverage position flows (open, update, close)

import { writeContract } from '@wagmi/core';
import { zeroAddress } from 'viem';
import { wagmiConfig, getBranchContract, getBranch, getProtocolContract } from '$lib/web3';
import { getTroveOperationHints } from '../hints';
import { needsApproval, approveToken } from '../approvals';
import type {
	OpenLeverageRequest,
	UpdateLeverageRequest,
	CloseLeverageRequest,
	TxStepDefinition
} from '../types';

// ETH gas compensation required by protocol
const ETH_GAS_COMPENSATION = 200n * 10n ** 15n; // 0.2 ETH

// Collateral symbols by branch index
const COLLATERAL_SYMBOLS = ['ETH', 'WSTETH', 'RETH'];

/**
 * Get the appropriate leverage zapper for a branch
 * - Branch 0 (ETH): LeverageWETHZapper
 * - Branch 1, 2 (LSTs): LeverageLSTZapper
 */
function getLeverageZapper(branchId: number) {
	const branch = getBranch(branchId);
	const isEthBranch = branch.symbol === 'ETH';

	if (isEthBranch) {
		return getBranchContract(branchId, 'LeverageWETHZapper');
	} else {
		return getBranchContract(branchId, 'LeverageLSTZapper');
	}
}

// ============================================
// Open Leveraged Position Flow
// ============================================

/**
 * Build steps for opening a leveraged position
 */
export async function getOpenLeverageSteps(
	request: OpenLeverageRequest
): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];
	const branch = getBranch(request.branchId);
	const isEthBranch = branch.symbol === 'ETH';
	const zapper = getLeverageZapper(request.branchId);

	// For LST branches, check if approval is needed
	if (!isEthBranch) {
		const collToken = getBranchContract(request.branchId, 'CollToken');
		const needsCollApproval = await needsApproval(
			collToken.address,
			request.account,
			zapper.address,
			request.collateralAmount
		);

		if (needsCollApproval) {
			steps.push({
				id: 'approveColl',
				label: `Approve ${branch.symbol}`,
				execute: async () => {
					return approveToken(collToken.address, zapper.address, request.collateralAmount);
				}
			});
		}
	}

	// Open leveraged trove step
	steps.push({
		id: 'openLeveragedTrove',
		label: 'Open Leveraged Position',
		execute: async () => {
			return executeOpenLeveragedTrove(request);
		}
	});

	return steps;
}

/**
 * Execute the open leveraged trove transaction
 */
async function executeOpenLeveragedTrove(request: OpenLeverageRequest): Promise<`0x${string}`> {
	const branch = getBranch(request.branchId);
	const isEthBranch = branch.symbol === 'ETH';
	const zapper = getLeverageZapper(request.branchId);

	// Get hints for the interest rate position
	const { upperHint, lowerHint } = await getTroveOperationHints(
		request.branchId,
		request.interestRate
	);

	// Build params struct
	const params = {
		owner: request.account,
		ownerIndex: BigInt(request.ownerIndex),
		collAmount: request.collateralAmount,
		flashLoanAmount: request.flashLoanAmount,
		boldAmount: request.boldAmount,
		upperHint,
		lowerHint,
		annualInterestRate: request.interestRate,
		batchManager: request.batchManager || zeroAddress,
		maxUpfrontFee: request.maxUpfrontFee,
		addManager: zapper.address, // Zapper manages the trove
		removeManager: zapper.address,
		receiver: zapper.address
	};

	// Calculate msg.value
	// For ETH: collAmount + gas compensation
	// For LST: just gas compensation (collateral is pulled via transfer)
	const msgValue = isEthBranch
		? request.collateralAmount + ETH_GAS_COMPENSATION
		: ETH_GAS_COMPENSATION;

	return writeContract(wagmiConfig, {
		...zapper,
		functionName: 'openLeveragedTroveWithRawETH',
		args: [params],
		value: msgValue
	});
}

/**
 * Get flow definition for opening leveraged position
 */
export function getOpenLeverageFlowDefinition(request: OpenLeverageRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Open Leveraged Position',
		getSteps: () => getOpenLeverageSteps(request),
		getSuccessMessage: () => `Successfully opened leveraged ${collSymbol} position`,
		getBackLink: () => ({ path: `/multiply/${collSymbol.toLowerCase()}`, label: 'Back to Multiply' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}

// ============================================
// Update Leverage Flow (Lever Up/Down)
// ============================================

/**
 * Build steps for updating leverage (lever up or down)
 */
export async function getUpdateLeverageSteps(
	request: UpdateLeverageRequest
): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];

	if (request.direction === 'up') {
		steps.push({
			id: 'leverUpTrove',
			label: 'Increase Leverage',
			execute: async () => executeLeverUp(request)
		});
	} else {
		steps.push({
			id: 'leverDownTrove',
			label: 'Decrease Leverage',
			execute: async () => executeLeverDown(request)
		});
	}

	return steps;
}

/**
 * Execute lever up (increase leverage)
 */
async function executeLeverUp(request: UpdateLeverageRequest): Promise<`0x${string}`> {
	const zapper = getLeverageZapper(request.branchId);
	const troveIdBn = BigInt(request.troveId);

	const params = {
		troveId: troveIdBn,
		flashLoanAmount: request.flashLoanAmount,
		boldAmount: request.boldAmount || 0n,
		maxUpfrontFee: request.maxUpfrontFee || 0n
	};

	return writeContract(wagmiConfig, {
		...zapper,
		functionName: 'leverUpTrove',
		args: [params]
	});
}

/**
 * Execute lever down (decrease leverage)
 */
async function executeLeverDown(request: UpdateLeverageRequest): Promise<`0x${string}`> {
	const zapper = getLeverageZapper(request.branchId);
	const troveIdBn = BigInt(request.troveId);

	const params = {
		troveId: troveIdBn,
		flashLoanAmount: request.flashLoanAmount,
		minBoldAmount: request.minBoldAmount || 0n
	};

	return writeContract(wagmiConfig, {
		...zapper,
		functionName: 'leverDownTrove',
		args: [params]
	});
}

/**
 * Get flow definition for updating leverage
 */
export function getUpdateLeverageFlowDefinition(request: UpdateLeverageRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';
	const action = request.direction === 'up' ? 'Increase' : 'Decrease';

	return {
		title: `${action} Leverage`,
		getSteps: () => getUpdateLeverageSteps(request),
		getSuccessMessage: () => `Successfully ${action.toLowerCase()}d leverage on ${collSymbol} position`,
		getBackLink: () => ({ path: `/loan`, label: 'Back to Position' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}

// ============================================
// Close Leveraged Position Flow
// ============================================

/**
 * Build steps for closing a leveraged position
 */
export async function getCloseLeverageSteps(
	request: CloseLeverageRequest
): Promise<TxStepDefinition[]> {
	return [
		{
			id: 'closeLeveragedTrove',
			label: 'Close Leveraged Position',
			execute: async () => executeCloseLeveragedTrove(request)
		}
	];
}

/**
 * Execute close leveraged trove (selling collateral to repay debt)
 */
async function executeCloseLeveragedTrove(request: CloseLeverageRequest): Promise<`0x${string}`> {
	const zapper = getLeverageZapper(request.branchId);
	const troveIdBn = BigInt(request.troveId);

	return writeContract(wagmiConfig, {
		...zapper,
		functionName: 'closeTroveFromCollateral',
		args: [troveIdBn, request.flashLoanAmount, request.minCollateralAmount]
	});
}

/**
 * Get flow definition for closing leveraged position
 */
export function getCloseLeverageFlowDefinition(request: CloseLeverageRequest) {
	const collSymbol = COLLATERAL_SYMBOLS[request.branchId] || 'Collateral';

	return {
		title: 'Close Leveraged Position',
		getSteps: () => getCloseLeverageSteps(request),
		getSuccessMessage: () => `Successfully closed leveraged ${collSymbol} position`,
		getBackLink: () => ({ path: `/loan`, label: 'Back to Position' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
