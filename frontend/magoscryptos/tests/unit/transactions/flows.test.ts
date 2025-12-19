import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
	OpenBorrowRequest,
	AdjustTroveRequest,
	CloseTroveRequest,
	EarnDepositRequest,
	EarnWithdrawRequest
} from '$lib/transactions/types';

// Mock wagmi
vi.mock('@wagmi/core', () => ({
	readContract: vi.fn(),
	writeContract: vi.fn().mockResolvedValue('0xmockhash' as `0x${string}`),
	waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'success' })
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
	getOpenBorrowFlowDefinition,
	getAdjustTroveFlowDefinition,
	getCloseTroveFlowDefinition,
	getEarnDepositFlowDefinition,
	getEarnWithdrawFlowDefinition,
	getEarnClaimFlowDefinition
} from '$lib/transactions/flows';

describe('Transaction Flow Definitions', () => {
	describe('getOpenBorrowFlowDefinition', () => {
		const mockRequest: OpenBorrowRequest = {
			flowId: 'openBorrow',
			account: '0x1234567890123456789012345678901234567890',
			branchId: 0,
			collateralAmount: 1000000000000000000n,
			borrowAmount: 2000000000000000000000n,
			interestRate: 50000000000000000n,
			maxUpfrontFee: 115792089237316195423570985008687907853269984665640564039457584007913129639935n
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getOpenBorrowFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Open Borrow Position');
		});

		it('returns correct success message for ETH branch', () => {
			const flowDef = getOpenBorrowFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully opened a ETH borrow position');
		});

		it('returns correct success message for WSTETH branch', () => {
			const request = { ...mockRequest, branchId: 1 };
			const flowDef = getOpenBorrowFlowDefinition(request);
			expect(flowDef.getSuccessMessage()).toBe('Successfully opened a WSTETH borrow position');
		});

		it('returns correct success message for RETH branch', () => {
			const request = { ...mockRequest, branchId: 2 };
			const flowDef = getOpenBorrowFlowDefinition(request);
			expect(flowDef.getSuccessMessage()).toBe('Successfully opened a RETH borrow position');
		});

		it('returns correct back link', () => {
			const flowDef = getOpenBorrowFlowDefinition(mockRequest);
			const backLink = flowDef.getBackLink();
			expect(backLink.path).toBe('/borrow/eth');
			expect(backLink.label).toBe('Back to Borrow');
		});

		it('returns correct success link', () => {
			const flowDef = getOpenBorrowFlowDefinition(mockRequest);
			const successLink = flowDef.getSuccessLink();
			expect(successLink.path).toBe('/');
			expect(successLink.label).toBe('View Dashboard');
		});

		it('has getSteps function', () => {
			const flowDef = getOpenBorrowFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});

	describe('getAdjustTroveFlowDefinition', () => {
		const mockRequest: AdjustTroveRequest = {
			flowId: 'adjustTrove',
			account: '0x1234567890123456789012345678901234567890',
			branchId: 0,
			troveId: '123',
			collateralChange: 500000000000000000n,
			debtChange: 1000000000000000000000n,
			maxUpfrontFee: 115792089237316195423570985008687907853269984665640564039457584007913129639935n
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getAdjustTroveFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Adjust Position');
		});

		it('returns correct success message', () => {
			const flowDef = getAdjustTroveFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully adjusted your ETH position');
		});

		it('returns correct back link', () => {
			const flowDef = getAdjustTroveFlowDefinition(mockRequest);
			const backLink = flowDef.getBackLink();
			expect(backLink.path).toBe('/loan');
			expect(backLink.label).toBe('Back to Loan');
		});

		it('has getSteps function', () => {
			const flowDef = getAdjustTroveFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});

	describe('getCloseTroveFlowDefinition', () => {
		const mockRequest: CloseTroveRequest = {
			flowId: 'closeTrove',
			account: '0x1234567890123456789012345678901234567890',
			branchId: 1,
			troveId: '456'
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getCloseTroveFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Close Position');
		});

		it('returns correct success message for WSTETH', () => {
			const flowDef = getCloseTroveFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully closed your WSTETH position');
		});

		it('returns correct back link', () => {
			const flowDef = getCloseTroveFlowDefinition(mockRequest);
			const backLink = flowDef.getBackLink();
			expect(backLink.path).toBe('/loan');
		});

		it('has getSteps function', () => {
			const flowDef = getCloseTroveFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});

	describe('getEarnDepositFlowDefinition', () => {
		const mockRequest: EarnDepositRequest = {
			flowId: 'earnDeposit',
			account: '0x1234567890123456789012345678901234567890',
			branchId: 0,
			amount: 5000000000000000000000n
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getEarnDepositFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Deposit to Stability Pool');
		});

		it('returns correct success message', () => {
			const flowDef = getEarnDepositFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully deposited BOLD to ETH Stability Pool');
		});

		it('returns correct back link', () => {
			const flowDef = getEarnDepositFlowDefinition(mockRequest);
			const backLink = flowDef.getBackLink();
			expect(backLink.path).toBe('/earn/eth');
		});

		it('has getSteps function', () => {
			const flowDef = getEarnDepositFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});

	describe('getEarnWithdrawFlowDefinition', () => {
		const mockRequest: EarnWithdrawRequest = {
			flowId: 'earnWithdraw',
			account: '0x1234567890123456789012345678901234567890',
			branchId: 2,
			amount: 1000000000000000000000n,
			claimRewards: false
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getEarnWithdrawFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Withdraw from Stability Pool');
		});

		it('returns correct success message for RETH', () => {
			const flowDef = getEarnWithdrawFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully withdrew BOLD from RETH Stability Pool');
		});

		it('returns correct back link', () => {
			const flowDef = getEarnWithdrawFlowDefinition(mockRequest);
			const backLink = flowDef.getBackLink();
			expect(backLink.path).toBe('/earn/reth');
		});

		it('has getSteps function', () => {
			const flowDef = getEarnWithdrawFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});

	describe('getEarnClaimFlowDefinition', () => {
		const mockRequest = {
			flowId: 'earnClaim' as const,
			account: '0x1234567890123456789012345678901234567890' as const,
			branchId: 0
		};

		it('returns flow definition with correct title', () => {
			const flowDef = getEarnClaimFlowDefinition(mockRequest);
			expect(flowDef.title).toBe('Claim Stability Pool Rewards');
		});

		it('returns correct success message', () => {
			const flowDef = getEarnClaimFlowDefinition(mockRequest);
			expect(flowDef.getSuccessMessage()).toBe('Successfully claimed ETH rewards');
		});

		it('has getSteps function', () => {
			const flowDef = getEarnClaimFlowDefinition(mockRequest);
			expect(typeof flowDef.getSteps).toBe('function');
		});
	});
});

describe('Transaction Flow Steps', () => {
	describe('OpenBorrow steps', () => {
		it('creates step for ETH without approval', async () => {
			const { getOpenBorrowSteps } = await import('$lib/transactions/flows/openBorrow');

			const request: OpenBorrowRequest = {
				flowId: 'openBorrow',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 0, // ETH branch - no approval needed
				collateralAmount: 1000000000000000000n,
				borrowAmount: 2000000000000000000000n,
				interestRate: 50000000000000000n,
				maxUpfrontFee: 115792089237316195423570985008687907853269984665640564039457584007913129639935n
			};

			const steps = await getOpenBorrowSteps(request);

			// ETH branch should only have openTrove step (no approval)
			expect(steps.length).toBeGreaterThanOrEqual(1);
			expect(steps[steps.length - 1].id).toBe('openTrove');
			expect(steps[steps.length - 1].label).toBe('Open Position');
		});
	});

	describe('EarnDeposit steps', () => {
		it('creates steps for stability pool deposit', async () => {
			const { getEarnDepositSteps } = await import('$lib/transactions/flows/earnDeposit');

			const request: EarnDepositRequest = {
				flowId: 'earnDeposit',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 0,
				amount: 5000000000000000000000n
			};

			const steps = await getEarnDepositSteps(request);

			// Should have at least the deposit step
			expect(steps.length).toBeGreaterThanOrEqual(1);
			expect(steps[steps.length - 1].id).toBe('deposit');
			expect(steps[steps.length - 1].label).toBe('Deposit to Stability Pool');
		});
	});

	describe('EarnWithdraw steps', () => {
		it('creates withdraw step', async () => {
			const { getEarnWithdrawSteps } = await import('$lib/transactions/flows/earnWithdraw');

			const request: EarnWithdrawRequest = {
				flowId: 'earnWithdraw',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 0,
				amount: 1000000000000000000000n,
				claimRewards: false
			};

			const steps = await getEarnWithdrawSteps(request);

			expect(steps.length).toBe(1);
			expect(steps[0].id).toBe('withdraw');
			expect(steps[0].label).toBe('Withdraw from Stability Pool');
		});

		it('creates claim step when using getEarnClaimSteps', async () => {
			const { getEarnClaimSteps } = await import('$lib/transactions/flows/earnWithdraw');

			const request = {
				flowId: 'earnClaim' as const,
				account: '0x1234567890123456789012345678901234567890' as const,
				branchId: 0
			};

			const steps = await getEarnClaimSteps(request);

			expect(steps.length).toBe(1);
			expect(steps[0].id).toBe('claim');
			expect(steps[0].label).toBe('Claim Rewards');
		});
	});
});
