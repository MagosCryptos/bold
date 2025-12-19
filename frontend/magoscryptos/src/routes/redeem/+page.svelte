<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button, TokenIcon } from '$lib/components/ui';

	let redeemAmount = $state('');

	// Mock data
	const redeemValue = $derived(parseFloat(redeemAmount) || 0);
	const fee = $derived(redeemValue * 0.005); // 0.5% fee
	const collateralReceived = $derived([
		{ symbol: 'ETH', amount: redeemValue * 0.5 / 2450, value: redeemValue * 0.5 },
		{ symbol: 'rETH', amount: redeemValue * 0.3 / 2600, value: redeemValue * 0.3 },
		{ symbol: 'wstETH', amount: redeemValue * 0.2 / 2700, value: redeemValue * 0.2 }
	]);
</script>

<Screen title="Redeem BOLD" subtitle="Exchange BOLD for underlying collateral at $1 value">
	<div class="redeem-container">
		<AmountInput
			bind:value={redeemAmount}
			symbol="BOLD"
			label="Redeem Amount"
			maxValue="10000"
		/>

		{#if redeemValue > 0}
			<div class="summary">
				<h3 class="summary-title">Redemption Summary</h3>

				<div class="collateral-breakdown">
					<span class="breakdown-label">You will receive:</span>
					{#each collateralReceived as coll}
						<div class="collateral-item">
							<div class="collateral-info">
								<TokenIcon symbol={coll.symbol} size="sm" />
								<span class="collateral-symbol">{coll.symbol}</span>
							</div>
							<div class="collateral-amounts">
								<span class="collateral-amount"><Amount value={coll.amount} decimals={6} /></span>
								<span class="collateral-value">${coll.value.toFixed(2)}</span>
							</div>
						</div>
					{/each}
				</div>

				<div class="summary-row">
					<span class="summary-label">Redemption Fee (0.5%)</span>
					<span class="summary-value">-<Amount value={fee} decimals={2} /> BOLD</span>
				</div>

				<div class="summary-row total">
					<span class="summary-label">Net Value</span>
					<span class="summary-value">$<Amount value={redeemValue - fee} decimals={2} /></span>
				</div>
			</div>
		{/if}

		<Button variant="primary" size="lg" disabled={redeemValue <= 0}>
			Redeem BOLD
		</Button>
	</div>
</Screen>

<style>
	.redeem-container {
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

	.collateral-breakdown {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	.breakdown-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.collateral-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-12);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.collateral-info {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	.collateral-symbol {
		font-weight: var(--weight-medium);
	}

	.collateral-amounts {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.collateral-amount {
		font-weight: var(--weight-medium);
	}

	.collateral-value {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-12);
		border-top: 1px solid var(--color-border);
	}

	.summary-row.total {
		font-weight: var(--weight-semibold);
	}

	.summary-label {
		color: var(--color-content-alt);
	}

	.summary-value {
		font-weight: var(--weight-medium);
	}
</style>
