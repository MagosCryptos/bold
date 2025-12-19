<script lang="ts">
	import { getContext } from 'svelte';
	import { InterestRateField } from '$lib/components/forms';
	import { Amount } from '$lib/components/display';
	import { Button, Alert } from '$lib/components/ui';
	import { DelegateModal } from '$lib/components/delegation';
	import { wallet } from '$lib/stores';
	import type { Delegate } from '$lib/types';
	import {
		txContext,
		getAdjustInterestRateFlowDefinition,
		getSetBatchManagerFlowDefinition,
		getRemoveFromBatchFlowDefinition,
		type AdjustInterestRateRequest,
		type SetBatchManagerRequest,
		type RemoveFromBatchRequest
	} from '$lib/transactions';
	import { parseEther, maxUint256 } from 'viem';

	// Get loan context from layout
	const loanContext = getContext<{ loan: any }>('loan');
	const loan = $derived(loanContext.loan);

	let interestRate = $state('5.5');
	let rateMode = $state<'manual' | 'delegate'>('manual');
	let isSubmitting = $state(false);
	let showDelegateModal = $state(false);
	let selectedDelegate = $state<Delegate | null>(null);

	// Use real values from loan context
	const currentRate = $derived(loan.interestRate);
	const currentDebt = $derived(loan.debtAmount);
	const isInBatch = $derived(loan.batchManager && loan.batchManager !== '0x0000000000000000000000000000000000000000');

	// Calculate yearly interest
	const newRate = $derived(parseFloat(interestRate) || 0);
	const yearlyInterest = $derived((currentDebt * newRate) / 100);
	const rateChange = $derived(newRate - currentRate);

	// Validation
	const isValidManualChange = $derived(
		wallet.isConnected && newRate > 0 && Math.abs(rateChange) > 0.01
	);
	const isValidDelegateChange = $derived(
		wallet.isConnected && selectedDelegate !== null
	);
	const isValidChange = $derived(
		rateMode === 'manual' ? isValidManualChange : isValidDelegateChange
	);

	function handleDelegateSelect(delegate: Delegate) {
		selectedDelegate = delegate;
		showDelegateModal = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!wallet.address) return;

		isSubmitting = true;
		try {
			if (rateMode === 'delegate' && selectedDelegate) {
				// Join batch delegation
				const request: SetBatchManagerRequest = {
					flowId: 'setBatchManager',
					account: wallet.address,
					branchId: loan.branchId,
					troveId: loan.id,
					batchManager: selectedDelegate.address,
					minInterestRate: selectedDelegate.constraints.minInterestRate,
					maxInterestRate: selectedDelegate.constraints.maxInterestRate,
					minInterestRateChangePeriod: selectedDelegate.constraints.minInterestRateChangePeriod
				};

				const flowDef = getSetBatchManagerFlowDefinition(request);
				await txContext.startFlow(request, flowDef);
			} else if (rateMode === 'manual' && isInBatch) {
				// Remove from batch and set new rate
				const newInterestRateBn = parseEther((newRate / 100).toString());

				const request: RemoveFromBatchRequest = {
					flowId: 'removeFromBatch',
					account: wallet.address,
					branchId: loan.branchId,
					troveId: loan.id,
					newInterestRate: newInterestRateBn
				};

				const flowDef = getRemoveFromBatchFlowDefinition(request);
				await txContext.startFlow(request, flowDef);
			} else {
				// Simple rate adjustment
				const newInterestRateBn = parseEther((newRate / 100).toString());

				const request: AdjustInterestRateRequest = {
					flowId: 'adjustInterestRate',
					account: wallet.address,
					branchId: loan.branchId,
					troveId: loan.id,
					newInterestRate: newInterestRateBn,
					maxUpfrontFee: maxUint256
				};

				const flowDef = getAdjustInterestRateFlowDefinition(request);
				await txContext.startFlow(request, flowDef);
			}
		} catch (error) {
			console.error('Failed to start rate adjustment flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function openDelegateModal() {
		showDelegateModal = true;
	}
</script>

<form class="rate-form" onsubmit={handleSubmit}>
	<div class="current-rate">
		<span class="current-label">Current Interest Rate</span>
		<span class="current-value">
			<Amount value={currentRate} decimals={2} suffix="%" size="lg" />
		</span>
	</div>

	<InterestRateField
		bind:value={interestRate}
		bind:mode={rateMode}
		label="New Interest Rate"
	/>

	<!-- Rate Preview -->
	<div class="preview">
		<h3 class="preview-title">Rate Change Summary</h3>
		<div class="preview-grid">
			<div class="preview-item">
				<span class="preview-label">New Rate</span>
				<span class="preview-value">
					<Amount value={newRate} decimals={2} suffix="%" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">Rate Change</span>
				<span class="preview-value" class:positive={rateChange < 0} class:negative={rateChange > 0}>
					{rateChange >= 0 ? '+' : ''}<Amount value={rateChange} decimals={2} suffix="%" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">Yearly Interest</span>
				<span class="preview-value">
					<Amount value={yearlyInterest} decimals={2} prefix="~" suffix=" BOLD" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">Outstanding Debt</span>
				<span class="preview-value">
					<Amount value={currentDebt} decimals={0} suffix=" BOLD" />
				</span>
			</div>
		</div>
	</div>

	<!-- Info about interest rates -->
	<Alert variant="info" title="About Interest Rates">
		<ul>
			<li>Higher rates provide more protection against redemptions</li>
			<li>Lower rates mean less interest payments but higher redemption risk</li>
			<li>Delegating rate management lets a batch manager optimize your rate</li>
		</ul>
	</Alert>

	<!-- Delegate Selection (when in delegate mode) -->
	{#if rateMode === 'delegate'}
		<div class="delegate-selection">
			{#if selectedDelegate}
				<div class="selected-delegate">
					<span class="delegate-label">Selected Delegate</span>
					<div class="delegate-info">
						<span class="delegate-name">{selectedDelegate.name}</span>
						<span class="delegate-rate">
							{(Number(selectedDelegate.interestRate) / 1e18 * 100).toFixed(2)}%
							{#if selectedDelegate.fee > 0}
								+ {(selectedDelegate.fee * 100).toFixed(2)}% fee
							{/if}
						</span>
					</div>
					<Button variant="secondary" size="sm" onclick={openDelegateModal}>
						Change Delegate
					</Button>
				</div>
			{:else}
				<Button variant="secondary" onclick={openDelegateModal}>
					Select a Delegate
				</Button>
			{/if}
		</div>
	{/if}

	{#if !wallet.isConnected}
		<Button type="button" variant="primary" size="lg" onclick={() => wallet.connect()}>
			Connect Wallet
		</Button>
	{:else}
		<Button
			type="submit"
			variant="primary"
			size="lg"
			disabled={!isValidChange || isSubmitting}
		>
			{#if isSubmitting}
				Processing...
			{:else if rateMode === 'delegate'}
				{selectedDelegate ? 'Set Delegate' : 'Select a Delegate'}
			{:else if isInBatch}
				Remove Delegate & Set Rate
			{:else}
				Update Interest Rate
			{/if}
		</Button>
	{/if}
</form>

<!-- Delegate Selection Modal -->
<DelegateModal
	branchId={loan.branchId}
	visible={showDelegateModal}
	onClose={() => showDelegateModal = false}
	onSelectDelegate={handleDelegateSelect}
/>

<style>
	.rate-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.current-rate {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-16);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.current-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.current-value {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.preview-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-16);
	}

	.preview-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.preview-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.preview-value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.preview-value.positive {
		color: var(--color-success);
	}

	.preview-value.negative {
		color: var(--color-warning);
	}

	.delegate-selection {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.selected-delegate {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.delegate-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.delegate-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.delegate-name {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.delegate-rate {
		font-size: var(--text-base);
		color: var(--color-content-alt);
	}
</style>
