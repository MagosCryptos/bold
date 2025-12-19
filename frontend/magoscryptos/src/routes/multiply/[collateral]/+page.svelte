<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput, InterestRateField, CollateralSelector } from '$lib/components/forms';
	import { Amount, RiskBadge, SummaryCard } from '$lib/components/display';
	import { Button, Slider, Alert } from '$lib/components/ui';
	import { TxModal } from '$lib/components/transactions';
	import { wallet, prices } from '$lib/stores';
	import { txContext, getOpenLeverageFlowDefinition, type OpenLeverageRequest } from '$lib/transactions';
	import { BRANCHES } from '$lib/web3';
	import {
		LEVERAGE_FACTOR_MIN,
		getMaxLeverageFactor,
		getLiquidationRisk,
		roundLeverageFactor,
		type RiskLevel
	} from '$lib/utils/leverage';
	import { calculateLeverageParams } from '$lib/leverage/quotes';
	import { parseEther, maxUint256 } from 'viem';

	const collateralParam = $derived($page.params.collateral?.toUpperCase() ?? 'ETH');

	// Get branch info
	const branch = $derived(BRANCHES.find(b => b.symbol === collateralParam) ?? BRANCHES[0]);
	const branchId = $derived(branch.id);

	// Form state
	let depositAmount = $state('');
	let leverageFactor = $state(2.0);
	let interestRate = $state('5.5');
	let interestMode = $state<'manual' | 'delegate'>('manual');
	let isSubmitting = $state(false);
	let isQuoting = $state(false);
	let quoteError = $state<string | null>(null);

	// Get real price from store
	const collateralPrice = $derived(prices.getRawPrice(branch.symbol) ?? 2450);

	// Min collateral ratio (depends on collateral type, ~110% for ETH, higher for LSTs)
	const minCollRatio = 1.1; // 110% collateral ratio
	const maxLeverage = $derived(getMaxLeverageFactor(minCollRatio));

	// Derived values
	const depositValue = $derived(parseFloat(depositAmount) * collateralPrice || 0);
	const depositBigInt = $derived(depositAmount ? parseEther(depositAmount) : 0n);

	// Leverage calculations
	const totalExposure = $derived(parseFloat(depositAmount) * leverageFactor || 0);
	const flashLoanAmount = $derived(totalExposure - parseFloat(depositAmount) || 0);
	const borrowAmount = $derived(flashLoanAmount * collateralPrice || 0);

	// Liquidation price = (debt * minCollRatio) / totalDeposit
	const liquidationPrice = $derived(
		borrowAmount > 0 && totalExposure > 0
			? (borrowAmount * minCollRatio) / totalExposure
			: 0
	);

	// LTV = debt / (totalDeposit * price)
	const ltv = $derived(
		totalExposure * collateralPrice > 0
			? borrowAmount / (totalExposure * collateralPrice)
			: 0
	);

	const maxLtv = $derived(1 / minCollRatio);
	const riskLevel = $derived<RiskLevel>(getLiquidationRisk(ltv, maxLtv));

	// Validation
	const isValidPosition = $derived(
		wallet.isConnected &&
		parseFloat(depositAmount) > 0 &&
		leverageFactor >= LEVERAGE_FACTOR_MIN &&
		leverageFactor <= maxLeverage
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!wallet.address || !isValidPosition) return;

		isSubmitting = true;
		quoteError = null;

		try {
			// Get leverage parameters from quote system
			isQuoting = true;
			const params = await calculateLeverageParams(
				depositBigInt,
				leverageFactor,
				branchId
			);
			isQuoting = false;

			// Convert interest rate to bigint (5.5% -> 0.055 -> 55000000000000000)
			const interestRateBn = parseEther((parseFloat(interestRate) / 100).toString());

			// Build request
			const request: OpenLeverageRequest = {
				flowId: 'openLeverage',
				account: wallet.address,
				branchId: branchId,
				ownerIndex: 0, // First trove for this user
				collateralAmount: depositBigInt,
				flashLoanAmount: params.flashLoanAmount,
				boldAmount: params.boldAmount,
				interestRate: interestRateBn,
				maxUpfrontFee: maxUint256
			};

			const flowDef = getOpenLeverageFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
		} catch (error) {
			console.error('Failed to start leverage flow:', error);
			quoteError = error instanceof Error ? error.message : 'Failed to calculate leverage';
		} finally {
			isSubmitting = false;
			isQuoting = false;
		}
	}

	function handleLeverageChange(value: number) {
		leverageFactor = roundLeverageFactor(Math.min(value, maxLeverage));
	}
</script>

<Screen title="Leverage {branch.symbol}" subtitle="Get leveraged exposure to {branch.symbol} using BOLD">
	<form class="leverage-form" onsubmit={handleSubmit}>
		<!-- Collateral Selection -->
		<CollateralSelector value={branch.symbol} label="Select Collateral" />

		<!-- Deposit Amount -->
		<AmountInput
			bind:value={depositAmount}
			symbol={branch.symbol}
			label="Deposit Collateral"
			secondaryValue={depositValue > 0 ? `$${depositValue.toLocaleString()}` : ''}
			maxValue="10.5"
			placeholder="0.00"
		/>

		<!-- Leverage Slider -->
		<Slider
			value={leverageFactor}
			onchange={(e) => handleLeverageChange(parseFloat(e.currentTarget.value))}
			min={LEVERAGE_FACTOR_MIN}
			max={Math.min(maxLeverage, 5)}
			step={0.1}
			label="Leverage"
			valueLabel="{leverageFactor.toFixed(1)}x"
			minLabel="{LEVERAGE_FACTOR_MIN}x"
			maxLabel="{Math.min(maxLeverage, 5).toFixed(1)}x"
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
						<Amount value={totalExposure} decimals={4} suffix={` ${branch.symbol}`} />
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
						<Amount value={ltv * 100} decimals={1} suffix="%" />
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
					<RiskBadge level={riskLevel === 'liquidatable' ? 'critical' : riskLevel} showLabel />
				</div>
			</div>
		</div>

		<!-- Quote Error -->
		{#if quoteError}
			<Alert variant="error" title="Quote Error">
				{quoteError}
			</Alert>
		{/if}

		<!-- Warning -->
		{#if ltv > 0.8}
			<Alert variant="warning" title="High Risk Warning">
				Your leveraged position has a high LTV ratio and may be liquidated if the collateral price drops.
			</Alert>
		{/if}

		<!-- Info -->
		<Alert variant="info" title="How Leverage Works">
			<ul>
				<li>Your deposit is used as collateral to borrow BOLD</li>
				<li>BOLD is swapped for more {branch.symbol} to increase exposure</li>
				<li>Higher leverage = higher potential gains but also higher liquidation risk</li>
			</ul>
		</Alert>

		<!-- Submit Button -->
		{#if !wallet.isConnected}
			<Button type="button" variant="primary" size="lg" onclick={() => wallet.connect()}>
				Connect Wallet
			</Button>
		{:else}
			<Button
				type="submit"
				variant="primary"
				size="lg"
				disabled={!isValidPosition || isSubmitting}
			>
				{#if isQuoting}
					Calculating...
				{:else if isSubmitting}
					Processing...
				{:else}
					Open Leveraged Position
				{/if}
			</Button>
		{/if}
	</form>

	<!-- Transaction Modal -->
	<TxModal />
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
