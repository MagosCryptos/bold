<script lang="ts">
	import { AmountInput } from '$lib/components/forms';
	import { Amount, RiskBadge } from '$lib/components/display';
	import { Button, Tabs } from '$lib/components/ui';

	let mode = $state<'add' | 'remove'>('add');
	let collateralAmount = $state('');
	let debtAmount = $state('');

	const modeTabs = [
		{ id: 'add', label: 'Add' },
		{ id: 'remove', label: 'Remove' }
	];

	// Mock current loan values
	const currentLoan = {
		collateral: 5.0,
		debt: 8500,
		collateralPrice: 2450
	};

	// Calculate new values
	const collateralChange = $derived(parseFloat(collateralAmount) || 0);
	const debtChange = $derived(parseFloat(debtAmount) || 0);

	const newCollateral = $derived(
		mode === 'add'
			? currentLoan.collateral + collateralChange
			: currentLoan.collateral - collateralChange
	);

	const newDebt = $derived(
		mode === 'add'
			? currentLoan.debt + debtChange
			: currentLoan.debt - debtChange
	);

	const newCollateralValue = $derived(newCollateral * currentLoan.collateralPrice);
	const newLtv = $derived(newCollateralValue > 0 ? (newDebt / newCollateralValue) * 100 : 0);
	const newLiquidationPrice = $derived(
		newDebt > 0 && newCollateral > 0 ? (newDebt * 1.1) / newCollateral : 0
	);

	const riskLevel = $derived<'low' | 'medium' | 'high' | 'critical'>(
		newLtv < 50 ? 'low' : newLtv < 70 ? 'medium' : newLtv < 85 ? 'high' : 'critical'
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		window.location.href = '/transactions';
	}
</script>

<form class="colldebt-form" onsubmit={handleSubmit}>
	<div class="mode-selector">
		<Tabs tabs={modeTabs} active={mode} onchange={(id) => mode = id as 'add' | 'remove'} />
	</div>

	<div class="inputs">
		<AmountInput
			bind:value={collateralAmount}
			symbol="ETH"
			label={mode === 'add' ? 'Add Collateral' : 'Remove Collateral'}
			maxValue={mode === 'remove' ? '4.5' : '10.0'}
			placeholder="0.00"
		/>

		<AmountInput
			bind:value={debtAmount}
			symbol="BOLD"
			label={mode === 'add' ? 'Borrow More' : 'Repay Debt'}
			maxValue={mode === 'remove' ? '8500' : undefined}
			placeholder="0.00"
		/>
	</div>

	<!-- Updated Loan Preview -->
	<div class="preview">
		<h3 class="preview-title">Updated Loan Position</h3>
		<div class="preview-grid">
			<div class="preview-item">
				<span class="preview-label">New Collateral</span>
				<span class="preview-value">
					<Amount value={newCollateral} decimals={4} suffix=" ETH" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">New Debt</span>
				<span class="preview-value">
					<Amount value={newDebt} decimals={2} suffix=" BOLD" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">New LTV</span>
				<span class="preview-value">
					<Amount value={newLtv} decimals={1} suffix="%" />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">Liquidation Price</span>
				<span class="preview-value">
					<Amount value={newLiquidationPrice} prefix="$" decimals={0} />
				</span>
			</div>
			<div class="preview-item">
				<span class="preview-label">Risk Level</span>
				<RiskBadge level={riskLevel} />
			</div>
		</div>
	</div>

	{#if newLtv > 80}
		<div class="warning">
			<strong>Warning:</strong> High LTV ratio. Your position may be at risk of liquidation.
		</div>
	{/if}

	{#if mode === 'remove' && newCollateral < 0}
		<div class="error">
			Cannot remove more collateral than you have deposited.
		</div>
	{:else if mode === 'remove' && newDebt < 0}
		<div class="error">
			Cannot repay more debt than you owe.
		</div>
	{:else}
		<Button type="submit" variant="primary" size="lg">
			{mode === 'add' ? 'Add to Position' : 'Remove from Position'}
		</Button>
	{/if}
</form>

<style>
	.colldebt-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.mode-selector {
		margin-bottom: var(--space-8);
	}

	.inputs {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
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

	.warning {
		padding: var(--space-16);
		background-color: var(--color-warning-surface);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-warning);
	}

	.error {
		padding: var(--space-16);
		background-color: var(--color-error-surface);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>
