// Transaction flow context store using Svelte 5 runes

import { waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '$lib/web3';
import type {
	TxFlowState,
	TxFlowStatus,
	TxStep,
	TxStepStatus,
	TxStepDefinition,
	TxRequest
} from './types';

// Svelte 5 runes-based transaction context store
class TxContextStore {
	// Current flow state
	private _flow = $state<TxFlowState | null>(null);

	// Modal visibility
	isOpen = $state(false);

	// Derived getters
	flow = $derived(this._flow);
	currentStep = $derived(
		this._flow && this._flow.currentStepIndex >= 0
			? this._flow.steps[this._flow.currentStepIndex]
			: null
	);
	isComplete = $derived(this._flow?.status === 'success');
	hasError = $derived(this._flow?.status === 'error');
	progress = $derived(
		this._flow ? (this._flow.currentStepIndex + 1) / this._flow.steps.length : 0
	);

	/**
	 * Start a new transaction flow
	 */
	async startFlow<T extends TxRequest>(
		request: T,
		definition: {
			title: string;
			getSteps: (request: T) => Promise<TxStepDefinition[]>;
			getSuccessMessage: (request: T) => string;
			getBackLink?: (request: T) => { path: string; label: string };
			getSuccessLink?: (request: T) => { path: string; label: string };
		}
	) {
		// Build steps from definition
		const stepDefs = await definition.getSteps(request);

		// Filter out skipped steps
		const activeSteps: { def: TxStepDefinition; step: TxStep }[] = [];
		for (const def of stepDefs) {
			const shouldSkip = def.shouldSkip ? await def.shouldSkip() : false;
			if (!shouldSkip) {
				activeSteps.push({
					def,
					step: {
						id: def.id,
						label: def.label,
						status: 'idle'
					}
				});
			}
		}

		// Initialize flow state
		this._flow = {
			id: request.flowId,
			title: definition.title,
			steps: activeSteps.map((s) => s.step),
			currentStepIndex: 0,
			status: 'idle',
			successMessage: definition.getSuccessMessage(request),
			backLink: definition.getBackLink?.(request),
			successLink: definition.getSuccessLink?.(request)
		};

		this.isOpen = true;

		// Execute steps sequentially
		await this.executeSteps(activeSteps.map((s) => s.def));
	}

	/**
	 * Execute all steps in sequence
	 */
	private async executeSteps(stepDefs: TxStepDefinition[]) {
		if (!this._flow) return;

		this._flow.status = 'pending';

		for (let i = 0; i < stepDefs.length; i++) {
			if (!this._flow) return; // Flow was cancelled

			this._flow.currentStepIndex = i;
			const def = stepDefs[i];

			try {
				// Update step status to pending
				this.updateStepStatus(i, 'pending');

				// Execute the step
				const txHash = await def.execute();

				// Update with tx hash and wait for confirmation
				this.updateStep(i, { status: 'confirming', txHash });

				// Wait for transaction receipt
				await waitForTransactionReceipt(wagmiConfig, {
					hash: txHash,
					confirmations: 1
				});

				// Mark step as success
				this.updateStepStatus(i, 'success');
			} catch (e) {
				const error = e instanceof Error ? e : new Error('Transaction failed');

				// Mark step as error
				this.updateStep(i, {
					status: 'error',
					error: {
						name: error.name,
						message: error.message
					}
				});

				// Mark flow as error
				this._flow.status = 'error';
				this._flow.error = error.message;
				return;
			}
		}

		// All steps completed successfully
		if (this._flow) {
			this._flow.status = 'success';
		}
	}

	/**
	 * Update a step's status
	 */
	private updateStepStatus(index: number, status: TxStepStatus) {
		if (!this._flow || index >= this._flow.steps.length) return;
		this._flow.steps[index] = { ...this._flow.steps[index], status };
	}

	/**
	 * Update a step with partial data
	 */
	private updateStep(index: number, update: Partial<TxStep>) {
		if (!this._flow || index >= this._flow.steps.length) return;
		this._flow.steps[index] = { ...this._flow.steps[index], ...update };
	}

	/**
	 * Retry the current failed step
	 */
	async retry() {
		// TODO: Implement retry logic
		console.log('Retry not yet implemented');
	}

	/**
	 * Close the transaction modal
	 */
	close() {
		this.isOpen = false;
	}

	/**
	 * Dismiss and reset the flow
	 */
	dismiss() {
		this.isOpen = false;
		this._flow = null;
	}

	/**
	 * Clear any error and allow retry
	 */
	clearError() {
		if (this._flow && this._flow.status === 'error') {
			this._flow.status = 'idle';
			this._flow.error = undefined;
			// Reset current step to idle
			if (this._flow.currentStepIndex >= 0) {
				this.updateStep(this._flow.currentStepIndex, {
					status: 'idle',
					error: undefined
				});
			}
		}
	}
}

// Export singleton instance
export const txContext = new TxContextStore();
