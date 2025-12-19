<script lang="ts">
	import { getContext } from 'svelte';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button, Checkbox, Alert } from '$lib/components/ui';
	import { wallet, prices } from '$lib/stores';
	import {
		txContext,
		getCloseTroveFlowDefinition,
		type CloseTroveRequest
	} from '$lib/transactions';

	// Get loan context from layout
	const loanContext = getContext<{ loan: any }>('loan');
	const loanData = $derived(loanContext.loan);

	// Use real loan data
	const loan = $derived({
		collateralSymbol: loanData.collateralSymbol,
		collateralAmount: loanData.collateralAmount,
		debtAmount: loanData.debtAmount,
		interestRate: loanData.interestRate,
		accruedInterest: 0 // TODO: Calculate from subgraph
	});

	const totalDebt = $derived(loan.debtAmount + loan.accruedInterest);
	const collateralPrice = $derived(prices.getRawPrice(loan.collateralSymbol) ?? 2450);
	const collateralValue = $derived(loan.collateralAmount * collateralPrice);

	let confirmed = $state(false);
	let isSubmitting = $state(false);

	async function handleClose(e: Event) {
		e.preventDefault();
		if (!wallet.address || !confirmed) return;

		isSubmitting = true;
		try {
			const request: CloseTroveRequest = {
				flowId: 'closeTrove',
				account: wallet.address,
				branchId: loanData.branchId,
				troveId: loanData.id
			};

			const flowDef = getCloseTroveFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
		} catch (error) {
			console.error('Failed to start close flow:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="close-panel">
	<div class="close-summary">
		<h3 class="summary-title">Close Loan Summary</h3>
		<p class="summary-description">
			Closing your loan will repay all outstanding debt and return your collateral.
		</p>

		<div class="summary-grid">
			<div class="summary-item">
				<span class="summary-label">Collateral to Receive</span>
				<TokenAmount value={loan.collateralAmount} symbol={loan.collateralSymbol} size="lg" />
				<span class="summary-secondary">
					~$<Amount value={collateralValue} decimals={0} />
				</span>
			</div>

			<div class="summary-item">
				<span class="summary-label">Total Debt to Repay</span>
				<TokenAmount value={totalDebt} symbol="BOLD" size="lg" />
			</div>
		</div>

		<div class="breakdown">
			<h4 class="breakdown-title">Debt Breakdown</h4>
			<div class="breakdown-item">
				<span>Principal</span>
				<span><Amount value={loan.debtAmount} decimals={2} suffix=" BOLD" /></span>
			</div>
			<div class="breakdown-item">
				<span>Accrued Interest</span>
				<span><Amount value={loan.accruedInterest} decimals={2} suffix=" BOLD" /></span>
			</div>
			<div class="breakdown-item total">
				<span>Total</span>
				<span><Amount value={totalDebt} decimals={2} suffix=" BOLD" /></span>
			</div>
		</div>
	</div>

	<!-- Warning -->
	<Alert variant="warning" title="Important">
		This action will close your loan position entirely.
		You will need to open a new loan if you want to borrow again.
	</Alert>

	<!-- Confirmation -->
	<Checkbox
		bind:checked={confirmed}
		label="I understand that this will close my loan and return my collateral"
	/>

	{#if !wallet.isConnected}
		<Button variant="primary" size="lg" onclick={() => wallet.connect()}>
			Connect Wallet
		</Button>
	{:else}
		<Button
			variant="negative"
			size="lg"
			disabled={!confirmed || isSubmitting}
			onclick={handleClose}
		>
			{isSubmitting ? 'Processing...' : 'Close Loan & Withdraw Collateral'}
		</Button>
	{/if}

	<p class="alternative">
		Need to adjust your position instead?
		<a href="/loan/colldebt">Update your collateral or debt</a>
	</p>
</div>

<style>
	.close-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.close-summary {
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

	.summary-description {
		color: var(--color-content-alt);
		margin: 0;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-24);
		padding: var(--space-16) 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.summary-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.summary-secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.breakdown {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.breakdown-title {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		margin: 0 0 var(--space-8) 0;
		color: var(--color-content-alt);
	}

	.breakdown-item {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-sm);
	}

	.breakdown-item.total {
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border);
		font-weight: var(--weight-semibold);
	}

	.alternative {
		text-align: center;
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.alternative a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.alternative a:hover {
		text-decoration: underline;
	}
</style>
