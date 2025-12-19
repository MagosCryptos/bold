// Hint helpers for sorted trove insertion
// These helpers find the correct position in the sorted trove list

import { readContract } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';

/**
 * Get hints for trove operations (open, adjust interest rate)
 * Hints help find the correct position in the sorted trove list
 */
export async function getTroveOperationHints(
	branchId: number,
	interestRate: bigint
): Promise<{ upperHint: bigint; lowerHint: bigint }> {
	// Get the number of troves in the sorted list
	const numTroves = await readContract(wagmiConfig, {
		...getBranchContract(branchId, 'SortedTroves'),
		functionName: 'getSize'
	});

	// Get approximate hint using HintHelpers contract
	// (10 * sqrt(troves)) gives a hint close to the right position
	const numTrials = 10n * BigInt(Math.ceil(Math.sqrt(Number(numTroves))));

	const [approxHint] = await readContract(wagmiConfig, {
		...getProtocolContract('HintHelpers'),
		functionName: 'getApproxHint',
		args: [
			BigInt(branchId),
			interestRate,
			numTrials,
			42n // random seed
		]
	});

	// Find exact insert position using approximate hint
	const [upperHint, lowerHint] = await readContract(wagmiConfig, {
		...getBranchContract(branchId, 'SortedTroves'),
		functionName: 'findInsertPosition',
		args: [interestRate, approxHint, approxHint]
	});

	return { upperHint, lowerHint };
}

/**
 * Get redemption hints for redeeming BOLD
 */
export async function getRedemptionHints(
	boldAmount: bigint,
	price: bigint,
	maxIterations: bigint = 0n
): Promise<{
	firstRedemptionHint: `0x${string}`;
	partialRedemptionUpperHint: bigint;
	partialRedemptionLowerHint: bigint;
	truncatedBoldAmount: bigint;
}> {
	const result = await readContract(wagmiConfig, {
		...getProtocolContract('HintHelpers'),
		functionName: 'getRedemptionHints',
		args: [boldAmount, price, maxIterations]
	});

	return {
		firstRedemptionHint: result[0] as `0x${string}`,
		partialRedemptionUpperHint: result[1] as bigint,
		partialRedemptionLowerHint: result[2] as bigint,
		truncatedBoldAmount: result[3] as bigint
	};
}
