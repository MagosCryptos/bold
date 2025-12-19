<script lang="ts">
	import { getContext } from 'svelte';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, RiskBadge } from '$lib/components/display';
	import { Button, Tabs, Alert } from '$lib/components/ui';
	import { wallet, prices } from '$lib/stores';
	import {
		txContext,
		getAdjustTroveFlowDefinition,
		type AdjustTroveRequest
	} from '$lib/transactions';
	import { parseEther, maxUint256 } from 'viem';

	// Get loan context from layout
	const loanContext = getContext<{ loan: any }>('loan');
	const loan = $derived(loanContext.loan);

	let mode = $state<'add' | 'remove'>('add');
	let collateralAmount = $state('');
	let debtAmount = $state('');
	let isSubmitting = $state(false);

	const modeTabs = [
		{ id: 'add', label: 'Add' },
		{ id: 'remove', label: 'Remove' }
	];

	// Get current loan values from context
	const currentLoan = $derived({
		collateral: loan.collateralAmount,
		debt: loan.debtAmount,
		collateralPrice: prices.getRawPrice(loan.collateralSymbol) ?? 2450
	});

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

	// Validation
	const hasCollateralChange = $derived(collateralChange > 0);
	const hasDebtChange = $derived(debtChange > 0);
	const hasAnyChange = $derived(hasCollateralChange || hasDebtChange);

	const isValidRemoval = $derived(
		mode !== 'remove' || (newCollateral >= 0 && newDebt >= 0)
	);

	const isValidForm = $derived(
		wallet.isConnected && hasAnyChange && isValidRemoval
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!wallet.address || !isValidForm) return;

		isSubmitting = true;
		try {
			// Calculate collateral and debt changes as BigInt
			// Positive = adding, negative = removing
			const collChangeAmount = parseEther(collateralAmount || '0');
			const debtChangeAmount = parseEther(debtAmount || '0');

			const collateralChangeBn = mode === 'add' ? collChangeAmount : -collChangeAmount;
			const debtChangeBn = mode === 'add' ? debtChangeAmount : -debtChangeAmount;

			const request: AdjustTroveRequest = {
				flowId: 'adjustTrove',
				account: wallet.address,
				branchId: loan.branchId,
				troveId: loan.id,
				collateralChange: collateralChangeBn,
				debtChange: debtChangeBn,
				maxUpfrontFee: maxUint256
			};

			const flowDef = getAdjustTroveFlowDefinition(request);
			await txContext.startFlow(request, flowDef);

			// Reset form on success
			collateralAmount = '';
			debtAmount = '';
		} catch (error) {
			console.error('Failed to start adjust flow:', error);
		} finally {
			isSubmitting = false;
		}
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
		<Alert variant="warning" title="Warning">
			High LTV ratio. Your position may be at risk of liquidation.
		</Alert>
	{/if}

	{#if mode === 'remove' && newCollateral < 0}
		<Alert variant="error">
			Cannot remove more collateral than you have deposited.
		</Alert>
	{:else if mode === 'remove' && newDebt < 0}
		<Alert variant="error">
			Cannot repay more debt than you owe.
		</Alert>
	{:else if !wallet.isConnected}
		<Button type="button" variant="primary" size="lg" onclick={() => wallet.connect()}>
			Connect Wallet
		</Button>
	{:else}
		<Button
			type="submit"
			variant="primary"
			size="lg"
			disabled={!isValidForm || isSubmitting}
		>
			{isSubmitting ? 'Processing...' : mode === 'add' ? 'Add to Position' : 'Remove from Position'}
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

</style>
