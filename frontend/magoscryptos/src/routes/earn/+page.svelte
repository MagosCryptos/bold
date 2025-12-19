<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { Amount } from '$lib/components/display';
	import { Button, TokenIcon } from '$lib/components/ui';

	const pools = [
		{ symbol: 'ETH', name: 'ETH Stability Pool', apr: 8.5, tvl: '45.2M', yourDeposit: 0 },
		{ symbol: 'rETH', name: 'rETH Stability Pool', apr: 9.2, tvl: '12.8M', yourDeposit: 5000 },
		{ symbol: 'wstETH', name: 'wstETH Stability Pool', apr: 8.8, tvl: '28.5M', yourDeposit: 0 },
		{ symbol: 'BOLD', name: 'sBOLD Vault', apr: 6.5, tvl: '89.4M', yourDeposit: 0 }
	];
</script>

<Screen title="Earn Rewards" subtitle="Deposit BOLD to earn liquidation rewards and yield" maxWidth="lg">
	<div class="pools-grid">
		{#each pools as pool}
			<a href="/earn/{pool.symbol.toLowerCase()}" class="pool-card">
				<div class="pool-header">
					<TokenIcon symbol={pool.symbol} size="lg" />
					<div class="pool-info">
						<span class="pool-name">{pool.name}</span>
						<span class="pool-symbol">{pool.symbol}</span>
					</div>
				</div>
				<div class="pool-stats">
					<div class="stat">
						<span class="stat-label">APR</span>
						<span class="stat-value apr"><Amount value={pool.apr} decimals={1} suffix="%" /></span>
					</div>
					<div class="stat">
						<span class="stat-label">TVL</span>
						<span class="stat-value">${pool.tvl}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Your Deposit</span>
						<span class="stat-value">
							{#if pool.yourDeposit > 0}
								<Amount value={pool.yourDeposit} decimals={0} /> BOLD
							{:else}
								—
							{/if}
						</span>
					</div>
				</div>
				<Button variant="secondary" size="sm">
					{pool.yourDeposit > 0 ? 'Manage' : 'Deposit'}
				</Button>
			</a>
		{/each}
	</div>
</Screen>

<style>
	.pools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-16);
	}

	.pool-card {
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

	.pool-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.pool-header {
		display: flex;
		align-items: center;
		gap: var(--space-16);
	}

	.pool-info {
		display: flex;
		flex-direction: column;
	}

	.pool-name {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.pool-symbol {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.pool-stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.stat-value {
		font-weight: var(--weight-medium);
	}

	.stat-value.apr {
		color: var(--color-positive);
		font-weight: var(--weight-semibold);
	}
</style>
