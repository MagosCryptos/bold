// Leverage/Multiply math utilities

// Constants
export const LEVERAGE_FACTOR_MIN = 1.1;
export const LEVERAGE_FACTOR_MAX = 11; // Max leverage factor (for UI)
export const LEVERAGE_FACTOR_PRECISION = 0.1;
export const MAX_LTV_ALLOWED_RATIO = 0.916666667; // ~91.67% of max LTV allowed when opening
export const SLIPPAGE_TOLERANCE = 0.05; // 5% slippage tolerance for leverage swaps

// Risk thresholds (as ratio of maxLTV)
export const LTV_RISK = {
	medium: 0.54,
	high: 0.73
} as const;

export type RiskLevel = 'low' | 'medium' | 'high' | 'liquidatable';

/**
 * Get LTV from leverage factor
 * Formula: LTV = (leverage - 1) / leverage
 */
export function getLtvFromLeverageFactor(leverageFactor: number): number | null {
	if (leverageFactor <= 0) return null;
	return (leverageFactor - 1) / leverageFactor;
}

/**
 * Get leverage factor from LTV
 * Formula: leverage = 1 / (1 - LTV)
 */
export function getLeverageFactorFromLtv(ltv: number): number {
	if (ltv >= 1) return Infinity;
	return 1 / (1 - ltv);
}

/**
 * Round leverage factor to precision
 */
export function roundLeverageFactor(leverageFactor: number): number {
	return Math.round(leverageFactor / LEVERAGE_FACTOR_PRECISION) * LEVERAGE_FACTOR_PRECISION;
}

/**
 * Get leverage factor from liquidation price
 */
export function getLeverageFactorFromLiquidationPrice(
	liquidationPrice: number,
	collPrice: number,
	minCollRatio: number
): number | null {
	const collPriceRatio = collPrice * minCollRatio;
	if (liquidationPrice >= collPriceRatio) return null;
	return collPriceRatio / (collPriceRatio - liquidationPrice);
}

/**
 * Get liquidation price from leverage factor
 */
export function getLiquidationPriceFromLeverage(
	leverage: number,
	collPrice: number,
	minCollRatio: number
): number {
	return ((leverage - 1) * minCollRatio * collPrice) / leverage;
}

/**
 * Get liquidation price from deposit and borrowed amounts
 */
export function getLiquidationPrice(
	deposit: number,
	borrowed: number,
	minCollRatio: number
): number | null {
	if (deposit <= 0 || borrowed <= 0) return null;
	if (minCollRatio <= 1) return null;
	return (borrowed * minCollRatio) / deposit;
}

/**
 * Get LTV (Loan-to-Value ratio)
 */
export function getLtv(deposit: number, debt: number, collPrice: number): number | null {
	const depositUsd = deposit * collPrice;
	return depositUsd > 0 ? debt / depositUsd : null;
}

/**
 * Get liquidation risk level based on current LTV vs max LTV
 */
export function getLiquidationRisk(ltv: number, maxLtv: number): RiskLevel {
	if (ltv <= 0) return 'low';
	if (ltv > maxLtv) return 'liquidatable';
	if (ltv > maxLtv * LTV_RISK.high) return 'high';
	if (ltv > maxLtv * LTV_RISK.medium) return 'medium';
	return 'low';
}

/**
 * Get max leverage factor allowed for a given collateral ratio
 */
export function getMaxLeverageFactor(minCollRatio: number): number {
	// maxLTV = 1 / minCollRatio
	// maxLeverage = 1 / (1 - maxLTV) = minCollRatio / (minCollRatio - 1)
	const maxLtv = 1 / minCollRatio;
	const maxLtvAllowed = maxLtv * MAX_LTV_ALLOWED_RATIO;
	return getLeverageFactorFromLtv(maxLtvAllowed);
}

/**
 * Calculate the amounts needed for a leveraged position
 *
 * @param initialDeposit - User's initial collateral deposit
 * @param leverageFactor - Desired leverage (e.g., 2.0 = 2x)
 * @param collPrice - Current collateral price in USD
 * @returns The amounts needed for the leveraged position
 */
export function calculateLeverageAmounts(
	initialDeposit: number,
	leverageFactor: number,
	collPrice: number
): {
	totalDeposit: number; // Total collateral after leverage
	flashLoanAmount: number; // Amount to borrow via flash loan
	debtAmount: number; // BOLD debt to take on
	ltv: number; // Resulting LTV
} {
	// Total exposure after leverage
	const totalDeposit = initialDeposit * leverageFactor;

	// Additional collateral needed from flash loan
	const flashLoanAmount = totalDeposit - initialDeposit;

	// Debt = value of flash loan amount (we swap this much BOLD to repay flash loan)
	// In practice: borrow BOLD, swap for collateral, use to repay flash loan
	const debtAmount = flashLoanAmount * collPrice;

	// LTV = debt / (totalDeposit * collPrice)
	const ltv = debtAmount / (totalDeposit * collPrice);

	return {
		totalDeposit,
		flashLoanAmount,
		debtAmount,
		ltv
	};
}

/**
 * Calculate leverage factor from deposit and debt
 */
export function calculateLeverageFromPosition(
	deposit: number,
	debt: number,
	collPrice: number
): number {
	const depositValue = deposit * collPrice;
	if (depositValue <= debt) return Infinity;
	// netDeposit = depositValue - debt
	// leverage = depositValue / netDeposit
	return depositValue / (depositValue - debt);
}

/**
 * Convert leverage ratio to collateral ratio (same as contract function)
 * Formula: CR = leverage / (leverage - 1)
 */
export function leverageRatioToCollateralRatio(leverageRatio: number): number {
	return leverageRatio / (leverageRatio - 1);
}

/**
 * Bigint versions for contract interactions
 */
export const DECIMAL_PRECISION = 10n ** 18n;

/**
 * Convert leverage factor (e.g., 2.5) to bigint with 18 decimals
 */
export function leverageFactorToBigInt(factor: number): bigint {
	return BigInt(Math.round(factor * 1e18));
}

/**
 * Convert bigint with 18 decimals to number
 */
export function bigIntToNumber(value: bigint, decimals: number = 18): number {
	return Number(value) / 10 ** decimals;
}

/**
 * Apply slippage to an amount (increase for output, decrease for input)
 */
export function applySlippage(amount: bigint, slippage: number, increase: boolean): bigint {
	const factor = increase ? 1 + slippage : 1 - slippage;
	return (amount * BigInt(Math.round(factor * 1e18))) / DECIMAL_PRECISION;
}
