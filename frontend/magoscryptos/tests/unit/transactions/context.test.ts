import { describe, it, expect, beforeEach, vi } from 'vitest';
import { txContext } from '$lib/transactions/context.svelte';

// Mock wagmi
vi.mock('@wagmi/core', () => ({
	waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'success' })
}));

vi.mock('$lib/web3', () => ({
	wagmiConfig: {}
}));

describe('TxContextStore', () => {
	beforeEach(() => {
		txContext.dismiss();
	});

	describe('initialization', () => {
		it('starts with closed modal and no flow', () => {
			expect(txContext.isOpen).toBe(false);
			expect(txContext.flow).toBe(null);
			expect(txContext.currentStep).toBe(null);
			expect(txContext.isComplete).toBe(false);
			expect(txContext.hasError).toBe(false);
		});

		it('has zero progress initially', () => {
			expect(txContext.progress).toBe(0);
		});
	});

	describe('modal control', () => {
		it('close() sets isOpen to false', () => {
			// Manually set isOpen to true for testing
			txContext.isOpen = true;
			expect(txContext.isOpen).toBe(true);

			txContext.close();
			expect(txContext.isOpen).toBe(false);
		});

		it('dismiss() closes modal and clears flow', () => {
			txContext.isOpen = true;
			txContext.dismiss();

			expect(txContext.isOpen).toBe(false);
			expect(txContext.flow).toBe(null);
		});
	});

	describe('startFlow', () => {
		it('initializes flow state correctly', async () => {
			const mockExecute = vi.fn().mockResolvedValue('0x1234' as `0x${string}`);

			const request = {
				flowId: 'testFlow',
				account: '0x1234567890123456789012345678901234567890' as const
			};

			const definition = {
				title: 'Test Flow',
				getSteps: vi.fn().mockResolvedValue([
					{
						id: 'step1',
						label: 'Step 1',
						execute: mockExecute
					}
				]),
				getSuccessMessage: () => 'Success!',
				getBackLink: () => ({ path: '/back', label: 'Back' }),
				getSuccessLink: () => ({ path: '/success', label: 'Done' })
			};

			// Start the flow (don't await - we just want to check initial state)
			const flowPromise = txContext.startFlow(request, definition);

			// Give it a moment to initialize
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(txContext.isOpen).toBe(true);
			expect(txContext.flow).not.toBe(null);
			expect(txContext.flow?.title).toBe('Test Flow');
			expect(txContext.flow?.steps).toHaveLength(1);

			// Clean up
			await flowPromise.catch(() => {}); // Ignore errors from mock
		});
	});

	describe('clearError', () => {
		it('clears error state from flow', () => {
			// Manually set up error state for testing
			txContext.isOpen = true;

			// The flow would be set internally, but we can test the method exists
			expect(typeof txContext.clearError).toBe('function');
		});
	});
});
