import { describe, it, expect } from 'vitest';
import type {
	Delegate,
	InterestRateChangeConstraints,
	KnownDelegate
} from '$lib/types';
import type {
	SetBatchManagerRequest,
	RemoveFromBatchRequest
} from '$lib/transactions/types';

describe('Batch Delegation Types', () => {
	describe('InterestRateChangeConstraints', () => {
		it('defines correct structure', () => {
			const constraints: InterestRateChangeConstraints = {
				minInterestRate: 500000000000000000n, // 0.5%
				maxInterestRate: 10000000000000000000n, // 10%
				minInterestRateChangePeriod: 604800n // 7 days in seconds
			};

			expect(constraints.minInterestRate).toBe(500000000000000000n);
			expect(constraints.maxInterestRate).toBe(10000000000000000000n);
			expect(constraints.minInterestRateChangePeriod).toBe(604800n);
		});
	});

	describe('Delegate', () => {
		it('defines correct structure', () => {
			const delegate: Delegate = {
				id: '0:0x1234567890123456789012345678901234567890',
				address: '0x1234567890123456789012345678901234567890',
				name: 'Test Delegate',
				interestRate: 5000000000000000000n, // 5%
				fee: 0.01, // 1%
				boldAmount: 1000000000000000000000n, // 1000 BOLD
				constraints: {
					minInterestRate: 500000000000000000n,
					maxInterestRate: 10000000000000000000n,
					minInterestRateChangePeriod: 604800n
				}
			};

			expect(delegate.id).toBe('0:0x1234567890123456789012345678901234567890');
			expect(delegate.address).toBe('0x1234567890123456789012345678901234567890');
			expect(delegate.name).toBe('Test Delegate');
			expect(delegate.interestRate).toBe(5000000000000000000n);
			expect(delegate.fee).toBe(0.01);
			expect(delegate.boldAmount).toBe(1000000000000000000000n);
		});
	});

	describe('KnownDelegate', () => {
		it('defines correct structure', () => {
			const knownDelegate: KnownDelegate = {
				address: '0x1234567890123456789012345678901234567890',
				name: 'Test Delegate',
				description: 'A test delegate for interest rate management',
				website: 'https://example.com',
				branches: [0, 1, 2]
			};

			expect(knownDelegate.address).toBe('0x1234567890123456789012345678901234567890');
			expect(knownDelegate.name).toBe('Test Delegate');
			expect(knownDelegate.branches).toEqual([0, 1, 2]);
		});

		it('allows optional fields', () => {
			const knownDelegate: KnownDelegate = {
				address: '0x1234567890123456789012345678901234567890',
				name: 'Minimal Delegate',
				branches: [0]
			};

			expect(knownDelegate.description).toBeUndefined();
			expect(knownDelegate.website).toBeUndefined();
		});
	});

	describe('SetBatchManagerRequest', () => {
		it('defines correct structure', () => {
			const request: SetBatchManagerRequest = {
				flowId: 'setBatchManager',
				account: '0xuser123456789012345678901234567890123456',
				branchId: 0,
				troveId: '12345',
				batchManager: '0x1234567890123456789012345678901234567890',
				minInterestRate: 500000000000000000n,
				maxInterestRate: 10000000000000000000n,
				minInterestRateChangePeriod: 604800n
			};

			expect(request.flowId).toBe('setBatchManager');
			expect(request.branchId).toBe(0);
			expect(request.troveId).toBe('12345');
			expect(request.batchManager).toBe('0x1234567890123456789012345678901234567890');
		});
	});

	describe('RemoveFromBatchRequest', () => {
		it('defines correct structure', () => {
			const request: RemoveFromBatchRequest = {
				flowId: 'removeFromBatch',
				account: '0xuser123456789012345678901234567890123456',
				branchId: 0,
				troveId: '12345',
				newInterestRate: 5500000000000000000n // 5.5%
			};

			expect(request.flowId).toBe('removeFromBatch');
			expect(request.branchId).toBe(0);
			expect(request.troveId).toBe('12345');
			expect(request.newInterestRate).toBe(5500000000000000000n);
		});
	});
});

describe('Delegate Rate Calculations', () => {
	it('converts interest rate from bigint to percentage', () => {
		// Rate is stored as a ratio in 18 decimals (0.055 = 5.5%)
		const rate = 55000000000000000n; // 0.055 in 18 decimals = 5.5%
		const percentage = Number(rate) / 1e18 * 100;
		expect(percentage).toBe(5.5);
	});

	it('calculates total rate including fee', () => {
		// Rate stored as ratio (0.05 = 5%)
		const interestRate = 50000000000000000n; // 0.05 in 18 decimals = 5%
		const fee = 0.01; // 1%

		const baseRatePercent = Number(interestRate) / 1e18 * 100;
		const totalRate = baseRatePercent + fee * 100;

		expect(totalRate).toBe(6);
	});

	it('formats BOLD amount correctly', () => {
		const amount = 1500000000000000000000n; // 1500 BOLD

		const value = Number(amount) / 1e18;
		expect(value).toBe(1500);

		// Compact format
		const compact = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
		expect(compact).toBe('1.5K');
	});

	it('calculates rate change period correctly', () => {
		const period = 604800n; // 7 days in seconds
		const days = Number(period) / 86400;
		expect(days).toBe(7);
	});
});

describe('Delegate Constraints Validation', () => {
	it('validates rate within constraints', () => {
		const constraints: InterestRateChangeConstraints = {
			minInterestRate: 1000000000000000000n, // 1%
			maxInterestRate: 10000000000000000000n, // 10%
			minInterestRateChangePeriod: 86400n // 1 day
		};

		const rate1 = 5000000000000000000n; // 5%
		const rate2 = 500000000000000000n; // 0.5%
		const rate3 = 15000000000000000000n; // 15%

		// Check if rate is within constraints
		const isWithin = (rate: bigint) =>
			rate >= constraints.minInterestRate && rate <= constraints.maxInterestRate;

		expect(isWithin(rate1)).toBe(true);
		expect(isWithin(rate2)).toBe(false); // Below min
		expect(isWithin(rate3)).toBe(false); // Above max
	});
});
