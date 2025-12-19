<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput, InterestRateField, CollateralSelector } from '$lib/components/forms';
	import { Amount, RiskBadge, SummaryCard } from '$lib/components/display';
	import { Button, Slider, Alert } from '$lib/components/ui';

	const collateral = $derived($page.params.collateral?.toUpperCase() ?? 'ETH');

	// Form state
	let depositAmount = $state('');
	let leverageFactor = $state(2.0);
	let interestRate = $state('5.5');
	let interestMode = $state<'manual' | 'delegate'>('manual');

	// Mock calculations
	const collateralPrice = 2450;
	const depositValue = $derived(parseFloat(depositAmount) * collateralPrice || 0);

	// Leverage calculations
	const totalExposure = $derived(parseFloat(depositAmount) * leverageFactor || 0);
	const borrowAmount = $derived((parseFloat(depositAmount) * (leverageFactor - 1) * collateralPrice) || 0);
	const liquidationPrice = $derived(
		borrowAmount > 0 && totalExposure > 0
			? (borrowAmount * 1.1) / totalExposure
			: 0
	);
	const ltv = $derived(
		totalExposure * collateralPrice > 0
			? (borrowAmount / (totalExposure * collateralPrice)) * 100
			: 0
	);

	const riskLevel = $derived<'low' | 'medium' | 'high' | 'critical'>(
		ltv < 50 ? 'low' : ltv < 70 ? 'medium' : ltv < 85 ? 'high' : 'critical'
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		window.location.href = '/transactions';
	}
</script>

<Screen title="Leverage {collateral}" subtitle="Get leveraged exposure to {collateral} using BOLD">
	<form class="leverage-form" onsubmit={handleSubmit}>
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

		<!-- Leverage Slider -->
		<Slider
			bind:value={leverageFactor}
			min={1.1}
			max={5}
			step={0.1}
			label="Leverage"
			valueLabel="{leverageFactor.toFixed(1)}x"
			minLabel="1.1x"
			maxLabel="5.0x"
		/>

		<!-- Interest Rate -->
		<InterestRateField
			bind:value={interestRate}
			bind:mode={interestMode}
		/>

		<!-- Position Summary -->
		<div class="summary">
			<h3 class="summary-title">Leveraged Position Summary</h3>
			<div class="summary-grid">
				<div class="summary-item highlight">
					<span class="summary-label">Total Exposure</span>
					<span class="summary-value">
						<Amount value={totalExposure} decimals={4} suffix={` ${collateral}`} />
					</span>
					<span class="summary-secondary">
						~$<Amount value={totalExposure * collateralPrice} decimals={0} />
					</span>
				</div>
				<div class="summary-item">
					<span class="summary-label">Debt</span>
					<span class="summary-value">
						<Amount value={borrowAmount} decimals={2} suffix=" BOLD" />
					</span>
				</div>
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
					<RiskBadge level={riskLevel} showLabel />
				</div>
			</div>
		</div>

		<!-- Warning -->
		{#if ltv > 80}
			<Alert variant="warning" title="High Risk Warning">
				Your leveraged position has a high LTV ratio and may be liquidated if the collateral price drops.
			</Alert>
		{/if}

		<!-- Info -->
		<Alert variant="info" title="How Leverage Works">
			<ul>
				<li>Your deposit is used as collateral to borrow BOLD</li>
				<li>BOLD is swapped for more {collateral} to increase exposure</li>
				<li>Higher leverage = higher potential gains but also higher liquidation risk</li>
			</ul>
		</Alert>

		<!-- Submit Button -->
		<Button type="submit" variant="primary" size="lg">
			Open Leveraged Position
		</Button>
	</form>
</Screen>

<style>
	.leverage-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
		max-width: 480px;
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

	.summary-item.highlight {
		grid-column: span 2;
		padding: var(--space-16);
		background-color: rgba(75, 110, 245, 0.1);
		border-radius: var(--radius-md);
	}

	.summary-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.summary-value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.summary-secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}
</style>
