import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock wagmi
const mockReadContract = vi.fn();

vi.mock('@wagmi/core', () => ({
	readContract: (...args: unknown[]) => mockReadContract(...args)
}));

vi.mock('$lib/web3', () => ({
	wagmiConfig: {},
	getBranchContract: vi.fn((branchId: number, contractName: string) => ({
		address: `0x${contractName}${branchId}` as `0x${string}`,
		abi: []
	})),
	getProtocolContract: vi.fn((contractName: string) => ({
		address: `0x${contractName}` as `0x${string}`,
		abi: []
	}))
}));

// Import after mocks
import { getTroveOperationHints } from '$lib/transactions/hints';

describe('Hint Helpers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getTroveOperationHints', () => {
		it('returns hints for trove insertion', async () => {
			const mockNumTroves = 100n;
			const mockApproxHint = BigInt('0x1234567890123456789012345678901234567890');
			const mockUpperHint = BigInt('0xaaaa');
			const mockLowerHint = BigInt('0xbbbb');

			// Setup mock responses in order:
			// 1. getSize call
			// 2. getApproxHint call
			// 3. findInsertPosition call
			mockReadContract
				.mockResolvedValueOnce(mockNumTroves)
				.mockResolvedValueOnce([mockApproxHint, 0n, 0n])
				.mockResolvedValueOnce([mockUpperHint, mockLowerHint]);

			const interestRate = 50000000000000000n; // 5%
			const hints = await getTroveOperationHints(0, interestRate);

			expect(hints).toHaveProperty('upperHint');
			expect(hints).toHaveProperty('lowerHint');
			expect(mockReadContract).toHaveBeenCalledTimes(3);
		});

		it('handles empty trove list', async () => {
			mockReadContract
				.mockResolvedValueOnce(0n) // No troves
				.mockResolvedValueOnce([0n, 0n, 0n]) // Approx hint returns 0
				.mockResolvedValueOnce([0n, 0n]); // Find position returns 0s

			const hints = await getTroveOperationHints(0, 50000000000000000n);

			expect(hints).toHaveProperty('upperHint');
			expect(hints).toHaveProperty('lowerHint');
		});

		it('works with different branches', async () => {
			mockReadContract
				.mockResolvedValueOnce(50n)
				.mockResolvedValueOnce([1n, 0n, 0n])
				.mockResolvedValueOnce([1n, 2n]);

			const hints = await getTroveOperationHints(1, 60000000000000000n);

			expect(hints.upperHint).toBeDefined();
			expect(hints.lowerHint).toBeDefined();
		});

		it('calculates numTrials based on trove count', async () => {
			// With 10000 troves, sqrt * 15 should give a reasonable number of trials
			mockReadContract
				.mockResolvedValueOnce(10000n)
				.mockResolvedValueOnce([1n, 0n, 0n])
				.mockResolvedValueOnce([1n, 2n]);

			await getTroveOperationHints(0, 50000000000000000n);

			// The getApproxHint should be called with calculated numTrials
			expect(mockReadContract).toHaveBeenCalledTimes(3);
		});
	});
});
