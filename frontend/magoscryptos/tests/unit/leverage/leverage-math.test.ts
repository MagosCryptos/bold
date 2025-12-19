import { describe, it, expect } from 'vitest';
import {
	getLtvFromLeverageFactor,
	getLeverageFactorFromLtv,
	roundLeverageFactor,
	getLeverageFactorFromLiquidationPrice,
	getLiquidationPriceFromLeverage,
	getLiquidationPrice,
	getLtv,
	getLiquidationRisk,
	getMaxLeverageFactor,
	calculateLeverageAmounts,
	calculateLeverageFromPosition,
	leverageRatioToCollateralRatio,
	leverageFactorToBigInt,
	bigIntToNumber,
	applySlippage,
	LEVERAGE_FACTOR_MIN,
	LEVERAGE_FACTOR_PRECISION,
	MAX_LTV_ALLOWED_RATIO,
	SLIPPAGE_TOLERANCE,
	DECIMAL_PRECISION
} from '$lib/utils/leverage';

describe('Leverage Math Utilities', () => {
	describe('getLtvFromLeverageFactor', () => {
		it('returns null for invalid leverage factor', () => {
			expect(getLtvFromLeverageFactor(0)).toBeNull();
			expect(getLtvFromLeverageFactor(-1)).toBeNull();
		});

		it('calculates LTV correctly for leverage 2x', () => {
			// LTV = (2 - 1) / 2 = 0.5 = 50%
			expect(getLtvFromLeverageFactor(2)).toBe(0.5);
		});

		it('calculates LTV correctly for leverage 3x', () => {
			// LTV = (3 - 1) / 3 = 0.6666...
			expect(getLtvFromLeverageFactor(3)).toBeCloseTo(0.6667, 3);
		});

		it('calculates LTV correctly for leverage 1.1x', () => {
			// LTV = (1.1 - 1) / 1.1 = 0.0909...
			expect(getLtvFromLeverageFactor(1.1)).toBeCloseTo(0.0909, 3);
		});
	});

	describe('getLeverageFactorFromLtv', () => {
		it('returns 1 for 0% LTV', () => {
			expect(getLeverageFactorFromLtv(0)).toBe(1);
		});

		it('returns 2 for 50% LTV', () => {
			expect(getLeverageFactorFromLtv(0.5)).toBe(2);
		});

		it('returns Infinity for 100% LTV', () => {
			expect(getLeverageFactorFromLtv(1)).toBe(Infinity);
		});

		it('calculates correctly for 66.67% LTV', () => {
			// leverage = 1 / (1 - 0.6667) = 3
			expect(getLeverageFactorFromLtv(0.6667)).toBeCloseTo(3, 1);
		});
	});

	describe('roundLeverageFactor', () => {
		it('rounds to precision', () => {
			expect(roundLeverageFactor(2.04)).toBe(2.0);
			// JavaScript Math.round rounds 0.5 to nearest even (banker's rounding varies)
			expect(roundLeverageFactor(2.06)).toBe(2.1);
			expect(roundLeverageFactor(2.14)).toBe(2.1);
			expect(roundLeverageFactor(2.16)).toBe(2.2);
		});
	});

	describe('getLiquidationPrice', () => {
		it('returns null for invalid inputs', () => {
			expect(getLiquidationPrice(0, 1000, 1.1)).toBeNull();
			expect(getLiquidationPrice(10, 0, 1.1)).toBeNull();
			expect(getLiquidationPrice(10, 1000, 1)).toBeNull();
		});

		it('calculates liquidation price correctly', () => {
			// deposit = 10 ETH, debt = 10000 BOLD, minCollRatio = 1.1
			// liquidationPrice = (10000 * 1.1) / 10 = 1100
			expect(getLiquidationPrice(10, 10000, 1.1)).toBe(1100);
		});
	});

	describe('getLtv', () => {
		it('returns null for zero deposit', () => {
			expect(getLtv(0, 1000, 2500)).toBeNull();
		});

		it('calculates LTV correctly', () => {
			// deposit = 10 ETH at $2500 = $25000, debt = $10000
			// LTV = 10000 / 25000 = 0.4 = 40%
			expect(getLtv(10, 10000, 2500)).toBe(0.4);
		});
	});

	describe('getLiquidationRisk', () => {
		const maxLtv = 0.9091; // ~90.91% for 110% collateral ratio

		it('returns low for low LTV', () => {
			expect(getLiquidationRisk(0.3, maxLtv)).toBe('low');
		});

		it('returns medium for medium LTV', () => {
			expect(getLiquidationRisk(0.55, maxLtv)).toBe('medium');
		});

		it('returns high for high LTV', () => {
			expect(getLiquidationRisk(0.75, maxLtv)).toBe('high');
		});

		it('returns liquidatable when LTV exceeds max', () => {
			expect(getLiquidationRisk(0.95, maxLtv)).toBe('liquidatable');
		});
	});

	describe('getMaxLeverageFactor', () => {
		it('calculates max leverage for 110% collateral ratio', () => {
			// maxLTV = 1/1.1 = 0.9091
			// maxLtvAllowed = 0.9091 * 0.9167 = 0.8333
			// maxLeverage = 1 / (1 - 0.8333) = 6
			const maxLev = getMaxLeverageFactor(1.1);
			expect(maxLev).toBeGreaterThan(5);
			expect(maxLev).toBeLessThan(7);
		});
	});

	describe('calculateLeverageAmounts', () => {
		it('calculates amounts for 2x leverage', () => {
			const result = calculateLeverageAmounts(1, 2, 2500);
			expect(result.totalDeposit).toBe(2);
			expect(result.flashLoanAmount).toBe(1);
			expect(result.debtAmount).toBe(2500);
			expect(result.ltv).toBeCloseTo(0.5, 2);
		});

		it('calculates amounts for 3x leverage', () => {
			const result = calculateLeverageAmounts(1, 3, 2500);
			expect(result.totalDeposit).toBe(3);
			expect(result.flashLoanAmount).toBe(2);
			expect(result.debtAmount).toBe(5000);
			expect(result.ltv).toBeCloseTo(0.6667, 3);
		});
	});

	describe('calculateLeverageFromPosition', () => {
		it('calculates leverage factor from position', () => {
			// 10 ETH at $2500 = $25000 collateral, $12500 debt = 2x leverage
			expect(calculateLeverageFromPosition(10, 12500, 2500)).toBe(2);
		});
	});

	describe('leverageRatioToCollateralRatio', () => {
		it('converts 2x leverage to 200% collateral ratio', () => {
			// CR = 2 / (2 - 1) = 2
			expect(leverageRatioToCollateralRatio(2)).toBe(2);
		});

		it('converts 3x leverage to 150% collateral ratio', () => {
			// CR = 3 / (3 - 1) = 1.5
			expect(leverageRatioToCollateralRatio(3)).toBe(1.5);
		});
	});

	describe('bigint conversions', () => {
		it('converts leverage factor to bigint', () => {
			expect(leverageFactorToBigInt(2.5)).toBe(2500000000000000000n);
		});

		it('converts bigint to number', () => {
			expect(bigIntToNumber(2500000000000000000n)).toBe(2.5);
		});
	});

	describe('applySlippage', () => {
		it('increases amount with slippage', () => {
			const amount = 1000000000000000000n; // 1 ETH
			const result = applySlippage(amount, 0.05, true);
			expect(result).toBe(1050000000000000000n); // 1.05 ETH
		});

		it('decreases amount with slippage', () => {
			const amount = 1000000000000000000n;
			const result = applySlippage(amount, 0.05, false);
			expect(result).toBe(950000000000000000n); // 0.95 ETH
		});
	});

	describe('constants', () => {
		it('has correct LEVERAGE_FACTOR_MIN', () => {
			expect(LEVERAGE_FACTOR_MIN).toBe(1.1);
		});

		it('has correct LEVERAGE_FACTOR_PRECISION', () => {
			expect(LEVERAGE_FACTOR_PRECISION).toBe(0.1);
		});

		it('has correct MAX_LTV_ALLOWED_RATIO', () => {
			expect(MAX_LTV_ALLOWED_RATIO).toBeCloseTo(0.9167, 3);
		});

		it('has correct SLIPPAGE_TOLERANCE', () => {
			expect(SLIPPAGE_TOLERANCE).toBe(0.05);
		});

		it('has correct DECIMAL_PRECISION', () => {
			expect(DECIMAL_PRECISION).toBe(10n ** 18n);
		});
	});
});
