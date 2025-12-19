<script lang="ts">
	import { getContext } from 'svelte';
	import { InterestRateField } from '$lib/components/forms';
	import { Amount } from '$lib/components/display';
	import { Button, Alert } from '$lib/components/ui';
	import { wallet } from '$lib/stores';
	import {
		txContext,
		getAdjustInterestRateFlowDefinition,
		type AdjustInterestRateRequest
	} from '$lib/transactions';
	import { parseEther, maxUint256 } from 'viem';

	// Get loan context from layout
	const loanContext = getContext<{ loan: any }>('loan');
	const loan = $derived(loanContext.loan);

	let interestRate = $state('5.5');
	let rateMode = $state<'manual' | 'delegate'>('manual');
	let isSubmitting = $state(false);

	// Use real values from loan context
	const currentRate = $derived(loan.interestRate);
	const currentDebt = $derived(loan.debtAmount);

	// Calculate yearly interest
	const newRate = $derived(parseFloat(interestRate) || 0);
	const yearlyInterest = $derived((currentDebt * newRate) / 100);
	const rateChange = $derived(newRate - currentRate);

	// Validation
	const isValidChange = $derived(
		wallet.isConnected && newRate > 0 && Math.abs(rateChange) > 0.01
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!wallet.address || !isValidChange) return;

		isSubmitting = true;
		try {
			// Convert percentage to decimal (5.5% -> 0.055) then to 18 decimals
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
		} catch (error) {
			console.error('Failed to start rate adjustment flow:', error);
		} finally {
			isSubmitting = false;
		}
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
			{isSubmitting ? 'Processing...' : 'Update Interest Rate'}
		</Button>
	{/if}
</form>

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

</style>
