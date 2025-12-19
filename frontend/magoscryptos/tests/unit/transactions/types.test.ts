import { describe, it, expect } from 'vitest';
import type {
	TxStep,
	TxFlowState,
	OpenBorrowRequest,
	EarnDepositRequest,
	EarnWithdrawRequest
} from '$lib/transactions/types';

describe('Transaction Types', () => {
	describe('TxStep', () => {
		it('represents a transaction step correctly', () => {
			const step: TxStep = {
				id: 'approve',
				label: 'Approve Token',
				status: 'idle'
			};

			expect(step.id).toBe('approve');
			expect(step.label).toBe('Approve Token');
			expect(step.status).toBe('idle');
			expect(step.txHash).toBeUndefined();
			expect(step.error).toBeUndefined();
		});

		it('can include transaction hash when confirming', () => {
			const step: TxStep = {
				id: 'deposit',
				label: 'Deposit',
				status: 'confirming',
				txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
			};

			expect(step.status).toBe('confirming');
			expect(step.txHash).toBeDefined();
		});

		it('can include error information', () => {
			const step: TxStep = {
				id: 'deposit',
				label: 'Deposit',
				status: 'error',
				error: {
					name: 'TransactionFailed',
					message: 'User rejected transaction'
				}
			};

			expect(step.status).toBe('error');
			expect(step.error?.name).toBe('TransactionFailed');
			expect(step.error?.message).toBe('User rejected transaction');
		});
	});

	describe('TxFlowState', () => {
		it('represents a complete flow state', () => {
			const flow: TxFlowState = {
				id: 'openBorrow',
				title: 'Open Borrow Position',
				steps: [
					{ id: 'approve', label: 'Approve ETH', status: 'success' },
					{ id: 'openTrove', label: 'Open Position', status: 'pending' }
				],
				currentStepIndex: 1,
				status: 'pending',
				successMessage: 'Position opened successfully',
				backLink: { path: '/borrow/eth', label: 'Back to Borrow' },
				successLink: { path: '/', label: 'View Dashboard' }
			};

			expect(flow.id).toBe('openBorrow');
			expect(flow.steps).toHaveLength(2);
			expect(flow.currentStepIndex).toBe(1);
			expect(flow.status).toBe('pending');
		});

		it('can represent error state', () => {
			const flow: TxFlowState = {
				id: 'earnDeposit',
				title: 'Deposit to Stability Pool',
				steps: [{ id: 'deposit', label: 'Deposit', status: 'error' }],
				currentStepIndex: 0,
				status: 'error',
				error: 'Insufficient balance'
			};

			expect(flow.status).toBe('error');
			expect(flow.error).toBe('Insufficient balance');
		});
	});

	describe('Request Types', () => {
		it('OpenBorrowRequest has required fields', () => {
			const request: OpenBorrowRequest = {
				flowId: 'openBorrow',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 0,
				collateralAmount: 1000000000000000000n, // 1 ETH
				borrowAmount: 2000000000000000000000n, // 2000 BOLD
				interestRate: 50000000000000000n, // 5%
				maxUpfrontFee: 115792089237316195423570985008687907853269984665640564039457584007913129639935n
			};

			expect(request.flowId).toBe('openBorrow');
			expect(request.branchId).toBe(0);
			expect(request.collateralAmount).toBe(1000000000000000000n);
		});

		it('EarnDepositRequest has required fields', () => {
			const request: EarnDepositRequest = {
				flowId: 'earnDeposit',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 1,
				amount: 5000000000000000000000n // 5000 BOLD
			};

			expect(request.flowId).toBe('earnDeposit');
			expect(request.branchId).toBe(1);
			expect(request.amount).toBe(5000000000000000000000n);
		});

		it('EarnWithdrawRequest has required fields', () => {
			const request: EarnWithdrawRequest = {
				flowId: 'earnWithdraw',
				account: '0x1234567890123456789012345678901234567890',
				branchId: 2,
				amount: 1000000000000000000000n, // 1000 BOLD
				claimRewards: true
			};

			expect(request.flowId).toBe('earnWithdraw');
			expect(request.claimRewards).toBe(true);
		});
	});
});
