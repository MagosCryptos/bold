// Quote system for leverage swaps using ExchangeHelpersV2

import { readContract } from '@wagmi/core';
import { wagmiConfig, getProtocolContract, getBranchContract } from '$lib/web3';
import type { BranchId } from '$lib/types';
import { SLIPPAGE_TOLERANCE, DECIMAL_PRECISION, applySlippage } from '$lib/utils/leverage';

/**
 * Quote the output amount for swapping a given input amount
 *
 * @param inputAmount - Amount to swap (in wei)
 * @param collToBold - If true, swap collateral → BOLD. If false, swap BOLD → collateral
 * @param branchId - The branch (collateral type) to use
 * @returns The output amount (in wei)
 */
export async function quoteExactInput(
	inputAmount: bigint,
	collToBold: boolean,
	branchId: BranchId
): Promise<bigint> {
	const exchangeHelpers = getProtocolContract('ExchangeHelpersV2');
	const collToken = getBranchContract(branchId, 'CollToken');

	const outputAmount = await readContract(wagmiConfig, {
		...exchangeHelpers,
		functionName: 'quoteExactInput',
		args: [inputAmount, collToBold, collToken.address]
	});

	return outputAmount;
}

/**
 * Quote the input amount needed to get a given output amount
 *
 * @param outputAmount - Desired output amount (in wei)
 * @param collToBold - If true, swap collateral → BOLD. If false, swap BOLD → collateral
 * @param branchId - The branch (collateral type) to use
 * @returns The input amount needed (in wei)
 */
export async function quoteExactOutput(
	outputAmount: bigint,
	collToBold: boolean,
	branchId: BranchId
): Promise<bigint> {
	const exchangeHelpers = getProtocolContract('ExchangeHelpersV2');
	const collToken = getBranchContract(branchId, 'CollToken');

	const inputAmount = await readContract(wagmiConfig, {
		...exchangeHelpers,
		functionName: 'quoteExactOutput',
		args: [outputAmount, collToBold, collToken.address]
	});

	return inputAmount;
}

/**
 * Calculate price impact by comparing marginal vs bulk exchange rate
 *
 * @param inputAmount - Amount to swap
 * @param collToBold - Swap direction
 * @param branchId - The branch
 * @returns Price impact as a decimal (e.g., 0.01 = 1%)
 */
export async function calculatePriceImpact(
	inputAmount: bigint,
	collToBold: boolean,
	branchId: BranchId
): Promise<number> {
	// Get output for full amount
	const outputAmount = await quoteExactInput(inputAmount, collToBold, branchId);

	// Get output for marginal amount (1/1000 of input)
	const marginalInput = inputAmount / 1000n;
	if (marginalInput === 0n) return 0;

	const marginalOutput = await quoteExactInput(marginalInput, collToBold, branchId);

	// Calculate exchange rates
	const bulkRate = (Number(outputAmount) / Number(inputAmount)) || 0;
	const marginalRate = (Number(marginalOutput) / Number(marginalInput)) || 0;

	// Price impact = (marginalRate - bulkRate) / marginalRate
	if (marginalRate === 0) return 0;
	return (marginalRate - bulkRate) / marginalRate;
}

/**
 * Get the BOLD amount needed to buy a specific amount of collateral
 * Used for opening leveraged positions (we need X collateral, how much BOLD to borrow?)
 */
export async function getBoldAmountForCollateral(
	collateralAmount: bigint,
	branchId: BranchId,
	withSlippage: boolean = true
): Promise<bigint> {
	// We want to output collateral, so collToBold = false (BOLD → Coll)
	const boldAmount = await quoteExactOutput(collateralAmount, false, branchId);

	if (withSlippage) {
		// Add slippage buffer (we might need more BOLD)
		return applySlippage(boldAmount, SLIPPAGE_TOLERANCE, true);
	}

	return boldAmount;
}

/**
 * Get the BOLD amount received from selling collateral
 * Used for closing positions or leveraging down
 */
export async function getBoldAmountFromCollateral(
	collateralAmount: bigint,
	branchId: BranchId,
	withSlippage: boolean = true
): Promise<bigint> {
	// We want to input collateral, so collToBold = true (Coll → BOLD)
	const boldAmount = await quoteExactInput(collateralAmount, true, branchId);

	if (withSlippage) {
		// Apply slippage (we might receive less BOLD)
		return applySlippage(boldAmount, SLIPPAGE_TOLERANCE, false);
	}

	return boldAmount;
}

/**
 * Calculate leverage position parameters
 *
 * @param initialDeposit - User's initial collateral (in wei)
 * @param leverageFactor - Desired leverage (e.g., 2.0 for 2x)
 * @param branchId - The branch
 * @returns Parameters needed for the leveraged position
 */
export async function calculateLeverageParams(
	initialDeposit: bigint,
	leverageFactor: number,
	branchId: BranchId
): Promise<{
	flashLoanAmount: bigint;
	boldAmount: bigint;
	totalDeposit: bigint;
	priceImpact: number;
}> {
	// Calculate flash loan amount (additional collateral needed)
	const leverageFactorBn = BigInt(Math.round(leverageFactor * 1e18));
	const totalDeposit = (initialDeposit * leverageFactorBn) / DECIMAL_PRECISION;
	const flashLoanAmount = totalDeposit - initialDeposit;

	// Get BOLD amount needed to buy the flash loan collateral (with slippage)
	const boldAmount = await getBoldAmountForCollateral(flashLoanAmount, branchId, true);

	// Calculate price impact
	const priceImpact = await calculatePriceImpact(boldAmount, false, branchId);

	return {
		flashLoanAmount,
		boldAmount,
		totalDeposit,
		priceImpact
	};
}

/**
 * Calculate deleveraging parameters (for reducing leverage)
 *
 * @param collateralToSell - Amount of collateral to sell (in wei)
 * @param branchId - The branch
 * @returns Parameters for the deleveraging operation
 */
export async function calculateDeleverageParams(
	collateralToSell: bigint,
	branchId: BranchId
): Promise<{
	flashLoanAmount: bigint;
	minBoldAmount: bigint;
	priceImpact: number;
}> {
	// Flash loan the collateral we want to sell
	const flashLoanAmount = collateralToSell;

	// Get minimum BOLD we'll receive (with slippage protection)
	const minBoldAmount = await getBoldAmountFromCollateral(collateralToSell, branchId, true);

	// Calculate price impact
	const priceImpact = await calculatePriceImpact(collateralToSell, true, branchId);

	return {
		flashLoanAmount,
		minBoldAmount,
		priceImpact
	};
}
