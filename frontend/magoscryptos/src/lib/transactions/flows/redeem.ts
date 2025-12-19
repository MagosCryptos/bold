// Redeem BOLD for collateral flow

import { writeContract } from '@wagmi/core';
import { wagmiConfig, getProtocolContract } from '$lib/web3';
import { needsApproval, approveToken } from '../approvals';
import type { RedeemBoldRequest, TxStepDefinition } from '../types';

// Default max iterations per collateral for redemption
const DEFAULT_MAX_ITERATIONS = 10;

/**
 * Build steps for redeeming BOLD
 */
export async function getRedeemBoldSteps(request: RedeemBoldRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];
	const collateralRegistry = getProtocolContract('CollateralRegistry');
	const boldToken = getProtocolContract('BoldToken');

	// Check if BOLD approval is needed for CollateralRegistry
	const needsBoldApproval = await needsApproval(
		boldToken.address,
		request.account,
		collateralRegistry.address,
		request.amount
	);

	if (needsBoldApproval) {
		steps.push({
			id: 'approve',
			label: 'Approve BOLD',
			execute: async () => {
				return approveToken(boldToken.address, collateralRegistry.address, request.amount);
			}
		});
	}

	// Redeem step
	steps.push({
		id: 'redeem',
		label: 'Redeem BOLD',
		execute: async () => {
			return executeRedeem(request);
		}
	});

	return steps;
}

/**
 * Execute the redemption
 */
async function executeRedeem(request: RedeemBoldRequest): Promise<`0x${string}`> {
	const collateralRegistry = getProtocolContract('CollateralRegistry');

	return writeContract(wagmiConfig, {
		...collateralRegistry,
		functionName: 'redeemCollateral',
		args: [
			request.amount,
			request.maxIterationsPerCollateral || DEFAULT_MAX_ITERATIONS,
			10n ** 18n // Max fee percentage (100%)
		]
	});
}

/**
 * Get flow definition for redeeming BOLD
 */
export function getRedeemBoldFlowDefinition(request: RedeemBoldRequest) {
	return {
		title: 'Redeem BOLD',
		getSteps: () => getRedeemBoldSteps(request),
		getSuccessMessage: () => 'Successfully redeemed BOLD for collateral',
		getBackLink: () => ({ path: '/redeem', label: 'Back to Redeem' }),
		getSuccessLink: () => ({ path: '/', label: 'View Dashboard' })
	};
}
