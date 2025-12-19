import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock wagmi
const mockReadContract = vi.fn();
const mockWriteContract = vi.fn();
const mockWaitForTransactionReceipt = vi.fn();

vi.mock('@wagmi/core', () => ({
	readContract: (...args: unknown[]) => mockReadContract(...args),
	writeContract: (...args: unknown[]) => mockWriteContract(...args),
	waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args)
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
import {
	getAllowance,
	needsApproval,
	approveToken,
	needsCollateralApproval,
	needsBoldApproval,
	needsBoldApprovalForStabilityPool,
	approveCollateralForBorrowing,
	approveBoldForRepayment,
	approveBoldForStabilityPool
} from '$lib/transactions/approvals';

describe('Approval Utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAllowance', () => {
		it('reads allowance from contract', async () => {
			mockReadContract.mockResolvedValue(1000000000000000000n);

			const allowance = await getAllowance(
				'0xtoken',
				'0xowner',
				'0xspender'
			);

			expect(mockReadContract).toHaveBeenCalled();
			expect(allowance).toBe(1000000000000000000n);
		});
	});

	describe('needsApproval', () => {
		it('returns true when allowance is less than amount', async () => {
			mockReadContract.mockResolvedValue(500n);

			const needs = await needsApproval(
				'0xtoken',
				'0xowner',
				'0xspender',
				1000n
			);

			expect(needs).toBe(true);
		});

		it('returns false when allowance is sufficient', async () => {
			mockReadContract.mockResolvedValue(2000n);

			const needs = await needsApproval(
				'0xtoken',
				'0xowner',
				'0xspender',
				1000n
			);

			expect(needs).toBe(false);
		});

		it('returns false when allowance equals amount', async () => {
			mockReadContract.mockResolvedValue(1000n);

			const needs = await needsApproval(
				'0xtoken',
				'0xowner',
				'0xspender',
				1000n
			);

			expect(needs).toBe(false);
		});
	});

	describe('approveToken', () => {
		it('writes approval and waits for receipt', async () => {
			const mockHash = '0xhash123' as `0x${string}`;
			mockWriteContract.mockResolvedValue(mockHash);
			mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });

			const hash = await approveToken('0xtoken', '0xspender', 1000n);

			expect(mockWriteContract).toHaveBeenCalled();
			expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ hash: mockHash })
			);
			expect(hash).toBe(mockHash);
		});
	});

	describe('needsCollateralApproval', () => {
		it('checks collateral token allowance for BorrowerOperations', async () => {
			mockReadContract.mockResolvedValue(0n);

			const needs = await needsCollateralApproval(
				1, // WSTETH branch
				'0xowner',
				1000n
			);

			expect(mockReadContract).toHaveBeenCalled();
			expect(needs).toBe(true);
		});

		it('returns false when already approved', async () => {
			mockReadContract.mockResolvedValue(10000n);

			const needs = await needsCollateralApproval(
				1,
				'0xowner',
				1000n
			);

			expect(needs).toBe(false);
		});
	});

	describe('needsBoldApproval', () => {
		it('checks BOLD allowance for BorrowerOperations', async () => {
			mockReadContract.mockResolvedValue(0n);

			const needs = await needsBoldApproval(
				0,
				'0xowner',
				5000n
			);

			expect(mockReadContract).toHaveBeenCalled();
			expect(needs).toBe(true);
		});
	});

	describe('needsBoldApprovalForStabilityPool', () => {
		it('checks BOLD allowance for StabilityPool', async () => {
			mockReadContract.mockResolvedValue(0n);

			const needs = await needsBoldApprovalForStabilityPool(
				0,
				'0xowner',
				5000n
			);

			expect(mockReadContract).toHaveBeenCalled();
			expect(needs).toBe(true);
		});
	});

	describe('approveCollateralForBorrowing', () => {
		it('approves collateral token for BorrowerOperations', async () => {
			const mockHash = '0xapprove' as `0x${string}`;
			mockWriteContract.mockResolvedValue(mockHash);
			mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });

			const hash = await approveCollateralForBorrowing(1, 1000n);

			expect(mockWriteContract).toHaveBeenCalled();
			expect(hash).toBe(mockHash);
		});
	});

	describe('approveBoldForRepayment', () => {
		it('approves BOLD for BorrowerOperations', async () => {
			const mockHash = '0xbold' as `0x${string}`;
			mockWriteContract.mockResolvedValue(mockHash);
			mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });

			const hash = await approveBoldForRepayment(0, 5000n);

			expect(mockWriteContract).toHaveBeenCalled();
			expect(hash).toBe(mockHash);
		});
	});

	describe('approveBoldForStabilityPool', () => {
		it('approves BOLD for StabilityPool', async () => {
			const mockHash = '0xstability' as `0x${string}`;
			mockWriteContract.mockResolvedValue(mockHash);
			mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });

			const hash = await approveBoldForStabilityPool(0, 5000n);

			expect(mockWriteContract).toHaveBeenCalled();
			expect(hash).toBe(mockHash);
		});
	});
});
