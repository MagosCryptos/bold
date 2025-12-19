<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { Amount } from '$lib/components/display';
	import { Button, TokenIcon } from '$lib/components/ui';

	// Mock legacy positions
	const legacyPositions = [
		{
			type: 'trove',
			collateral: 'ETH',
			collateralAmount: 5.2,
			debt: 8000
		}
	];

	const legacyStaking = {
		stakedLqty: 25000,
		earnedEth: 0.15,
		earnedLusd: 500
	};
</script>

<Screen title="Legacy Positions" subtitle="Migrate your Liquity V1 positions to V2">
	<div class="legacy-container">
		{#if legacyPositions.length > 0}
			<section class="section">
				<h2 class="section-title">V1 Troves</h2>
				{#each legacyPositions as position}
					<div class="legacy-card">
						<div class="card-header">
							<TokenIcon symbol={position.collateral} size="lg" />
							<div class="card-info">
								<span class="card-title">{position.collateral} Trove</span>
								<span class="card-subtitle">Liquity V1</span>
							</div>
						</div>
						<div class="card-stats">
							<div class="stat">
								<span class="stat-label">Collateral</span>
								<span class="stat-value"><Amount value={position.collateralAmount} decimals={2} /> {position.collateral}</span>
							</div>
							<div class="stat">
								<span class="stat-label">Debt</span>
								<span class="stat-value"><Amount value={position.debt} decimals={0} /> LUSD</span>
							</div>
						</div>
						<div class="card-actions">
							<Button variant="primary">Migrate to V2</Button>
							<Button variant="secondary">Close Position</Button>
						</div>
					</div>
				{/each}
			</section>
		{/if}

		{#if legacyStaking.stakedLqty > 0}
			<section class="section">
				<h2 class="section-title">V1 Staking</h2>
				<div class="legacy-card">
					<div class="card-header">
						<TokenIcon symbol="LQTY" size="lg" />
						<div class="card-info">
							<span class="card-title">LQTY Staking</span>
							<span class="card-subtitle">Liquity V1</span>
						</div>
					</div>
					<div class="card-stats">
						<div class="stat">
							<span class="stat-label">Staked</span>
							<span class="stat-value"><Amount value={legacyStaking.stakedLqty} decimals={0} /> LQTY</span>
						</div>
						<div class="stat">
							<span class="stat-label">ETH Rewards</span>
							<span class="stat-value"><Amount value={legacyStaking.earnedEth} decimals={4} /> ETH</span>
						</div>
						<div class="stat">
							<span class="stat-label">LUSD Rewards</span>
							<span class="stat-value"><Amount value={legacyStaking.earnedLusd} decimals={0} /> LUSD</span>
						</div>
					</div>
					<div class="card-actions">
						<Button variant="primary">Unstake All</Button>
						<Button variant="secondary">Claim Rewards</Button>
					</div>
				</div>
			</section>
		{/if}

		{#if legacyPositions.length === 0 && legacyStaking.stakedLqty === 0}
			<div class="empty-state">
				<p>No legacy positions found.</p>
				<Button variant="primary" onclick={() => window.location.href = '/'}>
					Go to Dashboard
				</Button>
			</div>
		{/if}
	</div>
</Screen>

<style>
	.legacy-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-32);
		max-width: 640px;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.section-title {
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.legacy-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-20);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-16);
	}

	.card-info {
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.card-subtitle {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.card-stats {
		display: flex;
		gap: var(--space-24);
		flex-wrap: wrap;
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
		font-weight: var(--weight-medium);
	}

	.card-actions {
		display: flex;
		gap: var(--space-12);
		padding-top: var(--space-16);
		border-top: 1px solid var(--color-border);
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
</style>
