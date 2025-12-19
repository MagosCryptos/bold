<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { PositionCard, Amount } from '$lib/components/display';
	import { Button, TokenIcon } from '$lib/components/ui';

	// Mock data for positions
	const positions = [
		{
			type: 'borrow' as const,
			collateralSymbol: 'ETH',
			collateralAmount: 10.5,
			debtAmount: 15000,
			ltv: 65.2,
			riskLevel: 'low' as const,
			interestRate: 5.5,
			href: '/loan?id=eth:1'
		},
		{
			type: 'earn' as const,
			collateralSymbol: 'rETH',
			depositAmount: 5000,
			earnedAmount: 0.125,
			apr: 8.2,
			href: '/earn/reth'
		}
	];

	// Mock data for collaterals
	const collaterals = [
		{ symbol: 'ETH', name: 'Ethereum', interestRate: '4.5 - 7.2%', maxLtv: '90.9%', totalDebt: '125.5M' },
		{ symbol: 'rETH', name: 'Rocket Pool ETH', interestRate: '3.8 - 6.5%', maxLtv: '83.3%', totalDebt: '45.2M' },
		{ symbol: 'wstETH', name: 'Lido Staked ETH', interestRate: '4.0 - 6.8%', maxLtv: '83.3%', totalDebt: '78.9M' }
	];

	// Mock data for earn pools
	const earnPools = [
		{ symbol: 'ETH', name: 'ETH Stability Pool', apr: 8.5, aprWeekly: 7.8, poolSize: '45.2M' },
		{ symbol: 'rETH', name: 'rETH Stability Pool', apr: 9.2, aprWeekly: 8.9, poolSize: '12.8M' },
		{ symbol: 'wstETH', name: 'wstETH Stability Pool', apr: 8.8, aprWeekly: 8.2, poolSize: '28.5M' },
		{ symbol: 'BOLD', name: 'sBOLD Vault', apr: 6.5, aprWeekly: 6.2, poolSize: '89.4M' }
	];
</script>

<Screen title="Dashboard" maxWidth="lg">
	<!-- Positions Section -->
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Your Positions</h2>
		</div>
		{#if positions.length > 0}
			<div class="positions-grid">
				{#each positions as position}
					<PositionCard {...position} />
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>You don't have any positions yet.</p>
				<Button variant="primary" onclick={() => window.location.href = '/borrow/eth'}>
					Open a Position
				</Button>
			</div>
		{/if}
	</section>

	<!-- Borrow Section -->
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Borrow BOLD</h2>
			<p class="section-subtitle">Deposit collateral and borrow BOLD stablecoin</p>
		</div>
		<div class="table-container">
			<table class="table">
				<thead>
					<tr>
						<th>Collateral</th>
						<th>Interest Rate</th>
						<th>Max LTV</th>
						<th>Total Debt</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each collaterals as coll}
						<tr>
							<td>
								<div class="collateral-cell">
									<TokenIcon symbol={coll.symbol} size="sm" />
									<div class="collateral-info">
										<span class="collateral-name">{coll.name}</span>
										<span class="collateral-symbol">{coll.symbol}</span>
									</div>
								</div>
							</td>
							<td>{coll.interestRate}</td>
							<td>{coll.maxLtv}</td>
							<td>${coll.totalDebt}</td>
							<td>
								<Button variant="secondary" size="sm" onclick={() => window.location.href = `/borrow/${coll.symbol.toLowerCase()}`}>
									Borrow
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Earn Section -->
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Earn Rewards</h2>
			<p class="section-subtitle">Deposit BOLD to earn liquidation rewards</p>
		</div>
		<div class="table-container">
			<table class="table">
				<thead>
					<tr>
						<th>Pool</th>
						<th>APR</th>
						<th>7d APR</th>
						<th>Pool Size</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each earnPools as pool}
						<tr>
							<td>
								<div class="collateral-cell">
									<TokenIcon symbol={pool.symbol} size="sm" />
									<span class="pool-name">{pool.name}</span>
								</div>
							</td>
							<td class="apr"><Amount value={pool.apr} decimals={1} suffix="%" /></td>
							<td><Amount value={pool.aprWeekly} decimals={1} suffix="%" /></td>
							<td>${pool.poolSize}</td>
							<td>
								<Button variant="secondary" size="sm" onclick={() => window.location.href = `/earn/${pool.symbol.toLowerCase()}`}>
									Deposit
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</Screen>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.section-title {
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.section-subtitle {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		margin: 0;
	}

	.positions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-16);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-16);
		padding: var(--space-48);
		background-color: var(--color-surface);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.empty-state p {
		color: var(--color-content-alt);
		margin: 0;
	}

	.table-container {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th,
	.table td {
		padding: var(--space-16);
		text-align: left;
	}

	.table th {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
		background-color: var(--color-surface-secondary);
		border-bottom: 1px solid var(--color-border);
	}

	.table td {
		border-bottom: 1px solid var(--color-border);
	}

	.table tr:last-child td {
		border-bottom: none;
	}

	.table tr:hover td {
		background-color: var(--color-surface-secondary);
	}

	.collateral-cell {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	.collateral-info {
		display: flex;
		flex-direction: column;
	}

	.collateral-name {
		font-weight: var(--weight-medium);
	}

	.collateral-symbol {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.pool-name {
		font-weight: var(--weight-medium);
	}

	.apr {
		font-weight: var(--weight-semibold);
		color: var(--color-positive);
	}

	@media (max-width: 768px) {
		.table-container {
			overflow-x: auto;
		}

		.table {
			min-width: 600px;
		}
	}
</style>
