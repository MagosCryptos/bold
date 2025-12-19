<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { Tabs, TokenIcon } from '$lib/components/ui';
	import { Amount, RiskBadge, TokenAmount } from '$lib/components/display';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Get current tab from URL
	const currentTab = $derived($page.url.pathname.split('/').pop() || 'colldebt');

	const tabs = [
		{ id: 'colldebt', label: 'Update Loan' },
		{ id: 'rate', label: 'Interest Rate' },
		{ id: 'close', label: 'Close Loan' }
	];

	// Mock loan data (would come from URL params + API in real app)
	const loan = {
		collateralSymbol: 'ETH',
		collateralAmount: 5.0,
		debtAmount: 8500,
		interestRate: 5.5,
		ltv: 69.4,
		liquidationPrice: 1870,
		riskLevel: 'medium' as const
	};

	function handleTabChange(tabId: string) {
		window.location.href = `/loan/${tabId}`;
	}
</script>

<Screen title="Manage Loan" subtitle="Adjust collateral, debt, interest rate, or close your loan">
	<!-- Loan Overview Card -->
	<div class="loan-card">
		<div class="loan-header">
			<div class="collateral-info">
				<TokenIcon symbol={loan.collateralSymbol} size="lg" />
				<div class="collateral-details">
					<span class="collateral-label">Collateral</span>
					<TokenAmount value={loan.collateralAmount} symbol={loan.collateralSymbol} size="lg" />
				</div>
			</div>
			<RiskBadge level={loan.riskLevel} showLabel />
		</div>

		<div class="loan-stats">
			<div class="stat">
				<span class="stat-label">Debt</span>
				<TokenAmount value={loan.debtAmount} symbol="BOLD" />
			</div>
			<div class="stat">
				<span class="stat-label">Interest Rate</span>
				<Amount value={loan.interestRate} decimals={2} suffix="%" />
			</div>
			<div class="stat">
				<span class="stat-label">LTV</span>
				<Amount value={loan.ltv} decimals={1} suffix="%" />
			</div>
			<div class="stat">
				<span class="stat-label">Liquidation Price</span>
				<Amount value={loan.liquidationPrice} prefix="$" decimals={0} />
			</div>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="tab-container">
		<Tabs {tabs} active={currentTab} onchange={handleTabChange} />
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{@render children()}
	</div>
</Screen>

<style>
	.loan-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-24);
	}

	.loan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.collateral-info {
		display: flex;
		align-items: center;
		gap: var(--space-16);
	}

	.collateral-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.collateral-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.loan-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-16);
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.tab-container {
		margin-bottom: var(--space-24);
	}

	.tab-content {
		max-width: 480px;
	}

	@media (max-width: 768px) {
		.loan-stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
