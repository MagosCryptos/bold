<script lang="ts">
	import TokenIcon from '../ui/TokenIcon.svelte';
	import RiskBadge from './RiskBadge.svelte';
	import Amount from './Amount.svelte';

	interface Props {
		type: 'borrow' | 'earn' | 'stake';
		collateralSymbol?: string;
		collateralAmount?: number;
		debtAmount?: number;
		depositAmount?: number;
		earnedAmount?: number;
		ltv?: number;
		riskLevel?: 'low' | 'medium' | 'high' | 'critical';
		interestRate?: number;
		apr?: number;
		href?: string;
	}

	let {
		type,
		collateralSymbol = 'ETH',
		collateralAmount = 0,
		debtAmount = 0,
		depositAmount = 0,
		earnedAmount = 0,
		ltv = 0,
		riskLevel = 'low',
		interestRate = 0,
		apr = 0,
		href = '#'
	}: Props = $props();
</script>

<a class="position-card" {href}>
	<div class="header">
		<div class="type-badge {type}">
			{#if type === 'borrow'}
				Borrow Position
			{:else if type === 'earn'}
				Earn Position
			{:else}
				Staking
			{/if}
		</div>
		{#if type === 'borrow' && riskLevel}
			<RiskBadge level={riskLevel} showLabel={false} />
		{/if}
	</div>

	<div class="content">
		{#if type === 'borrow'}
			<div class="collateral">
				<TokenIcon symbol={collateralSymbol} size="lg" />
				<div class="values">
					<span class="label">Collateral</span>
					<span class="value">
						<Amount value={collateralAmount} decimals={4} /> {collateralSymbol}
					</span>
				</div>
			</div>
			<div class="stats">
				<div class="stat">
					<span class="stat-label">Debt</span>
					<span class="stat-value"><Amount value={debtAmount} decimals={2} /> BOLD</span>
				</div>
				<div class="stat">
					<span class="stat-label">LTV</span>
					<span class="stat-value"><Amount value={ltv} decimals={1} suffix="%" /></span>
				</div>
				<div class="stat">
					<span class="stat-label">Interest</span>
					<span class="stat-value"><Amount value={interestRate} decimals={2} suffix="%" /></span>
				</div>
			</div>
		{:else if type === 'earn'}
			<div class="collateral">
				<TokenIcon symbol={collateralSymbol} size="lg" />
				<div class="values">
					<span class="label">Deposited</span>
					<span class="value">
						<Amount value={depositAmount} decimals={2} /> BOLD
					</span>
				</div>
			</div>
			<div class="stats">
				<div class="stat">
					<span class="stat-label">Pool</span>
					<span class="stat-value">{collateralSymbol}</span>
				</div>
				<div class="stat">
					<span class="stat-label">Earned</span>
					<span class="stat-value"><Amount value={earnedAmount} decimals={4} /> {collateralSymbol}</span>
				</div>
				<div class="stat">
					<span class="stat-label">APR</span>
					<span class="stat-value"><Amount value={apr} decimals={2} suffix="%" /></span>
				</div>
			</div>
		{:else}
			<div class="collateral">
				<TokenIcon symbol="LQTY" size="lg" />
				<div class="values">
					<span class="label">Staked</span>
					<span class="value">
						<Amount value={depositAmount} decimals={2} /> LQTY
					</span>
				</div>
			</div>
			<div class="stats">
				<div class="stat">
					<span class="stat-label">Voting Power</span>
					<span class="stat-value"><Amount value={depositAmount} decimals={0} /></span>
				</div>
				<div class="stat">
					<span class="stat-label">Earned</span>
					<span class="stat-value"><Amount value={earnedAmount} decimals={2} /> BOLD</span>
				</div>
			</div>
		{/if}
	</div>
</a>

<style>
	.position-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-fast);
	}

	.position-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.type-badge {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		padding: var(--space-4) var(--space-12);
		border-radius: var(--radius-full);
	}

	.type-badge.borrow {
		background-color: var(--color-info-surface);
		color: var(--color-info);
	}

	.type-badge.earn {
		background-color: var(--color-positive-surface);
		color: var(--color-positive);
	}

	.type-badge.stake {
		background-color: #F3E8FF;
		color: #745DDF;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.collateral {
		display: flex;
		align-items: center;
		gap: var(--space-16);
	}

	.values {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.value {
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
	}

	.stats {
		display: flex;
		gap: var(--space-24);
		padding-top: var(--space-16);
		border-top: 1px solid var(--color-border);
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

	.stat-value {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
	}
</style>
