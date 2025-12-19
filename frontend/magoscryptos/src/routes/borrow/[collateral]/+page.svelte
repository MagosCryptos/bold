<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput, InterestRateField, CollateralSelector } from '$lib/components/forms';
	import { Amount, RiskBadge } from '$lib/components/display';
	import { Button, Alert } from '$lib/components/ui';

	const collateral = $derived($page.params.collateral?.toUpperCase() ?? 'ETH');

	// Form state
	let depositAmount = $state('');
	let borrowAmount = $state('');
	let interestRate = $state('5.5');
	let interestMode = $state<'manual' | 'delegate'>('manual');

	// Mock calculations
	const collateralPrice = 2450; // Mock ETH price
	const depositValue = $derived(parseFloat(depositAmount) * collateralPrice || 0);
	const borrowValue = $derived(parseFloat(borrowAmount) || 0);
	const ltv = $derived(depositValue > 0 ? (borrowValue / depositValue) * 100 : 0);
	const liquidationPrice = $derived(borrowValue > 0 && parseFloat(depositAmount) > 0
		? (borrowValue * 1.1) / parseFloat(depositAmount)
		: 0
	);

	const riskLevel = $derived<'low' | 'medium' | 'high' | 'critical'>(
		ltv < 50 ? 'low' : ltv < 70 ? 'medium' : ltv < 85 ? 'high' : 'critical'
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		// Would trigger transaction flow
		window.location.href = '/transactions';
	}
</script>

<Screen title="Borrow BOLD" subtitle="Deposit collateral and borrow BOLD stablecoin">
	<form class="borrow-form" onsubmit={handleSubmit}>
		<!-- Collateral Selection -->
		<CollateralSelector value={collateral} label="Select Collateral" />

		<!-- Deposit Amount -->
		<AmountInput
			bind:value={depositAmount}
			symbol={collateral}
			label="Deposit Collateral"
			secondaryValue={depositValue > 0 ? `$${depositValue.toLocaleString()}` : ''}
			maxValue="10.5"
			placeholder="0.00"
		/>

		<!-- Borrow Amount -->
		<AmountInput
			bind:value={borrowAmount}
			symbol="BOLD"
			label="Borrow BOLD"
			secondaryValue=""
			placeholder="0.00"
		/>

		<!-- Quick Amount Suggestions -->
		<div class="suggestions">
			<span class="suggestions-label">Suggested amounts:</span>
			<div class="suggestion-buttons">
				<button type="button" class="suggestion" onclick={() => borrowAmount = '2000'}>2,000</button>
				<button type="button" class="suggestion" onclick={() => borrowAmount = '5000'}>5,000</button>
				<button type="button" class="suggestion" onclick={() => borrowAmount = '10000'}>10,000</button>
			</div>
		</div>

		<!-- Interest Rate -->
		<InterestRateField
			bind:value={interestRate}
			bind:mode={interestMode}
		/>

		<!-- Loan Summary -->
		<div class="summary">
			<h3 class="summary-title">Loan Summary</h3>
			<div class="summary-grid">
				<div class="summary-item">
					<span class="summary-label">Loan to Value (LTV)</span>
					<span class="summary-value">
						<Amount value={ltv} decimals={1} suffix="%" />
					</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Liquidation Price</span>
					<span class="summary-value">
						<Amount value={liquidationPrice} prefix="$" decimals={2} />
					</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Interest Rate</span>
					<span class="summary-value">
						<Amount value={parseFloat(interestRate) || 0} decimals={2} suffix="%" />
					</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Risk Level</span>
					<RiskBadge level={riskLevel} />
				</div>
			</div>
		</div>

		<!-- Warning -->
		{#if ltv > 80}
			<Alert variant="warning" title="High Risk Warning">
				Your position has a high LTV ratio and may be liquidated if the collateral price drops.
			</Alert>
		{/if}

		<!-- Submit Button -->
		<Button type="submit" variant="primary" size="lg">
			Open Borrow Position
		</Button>
	</form>
</Screen>

<style>
	.borrow-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
		max-width: 480px;
	}

	.suggestions {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	.suggestions-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.suggestion-buttons {
		display: flex;
		gap: var(--space-8);
	}

	.suggestion {
		padding: var(--space-4) var(--space-12);
		font-size: var(--text-sm);
		color: var(--color-primary);
		background-color: rgba(75, 110, 245, 0.1);
		border-radius: var(--radius-full);
		transition: all var(--transition-fast);
	}

	.suggestion:hover {
		background-color: rgba(75, 110, 245, 0.2);
	}

	.summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.summary-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-16);
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.summary-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.summary-value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

</style>
