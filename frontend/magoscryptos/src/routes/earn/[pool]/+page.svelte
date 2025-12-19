<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button, Tabs, TokenIcon } from '$lib/components/ui';

	const pool = $derived($page.params.pool?.toUpperCase() ?? 'ETH');

	let activeTab = $state('deposit');
	let depositAmount = $state('');

	const tabs = [
		{ id: 'deposit', label: 'Deposit' },
		{ id: 'claim', label: 'Claim' },
		{ id: 'compound', label: 'Compound' }
	];

	// Mock data
	const poolData = {
		apr: 8.5,
		tvl: '45.2M',
		yourDeposit: 5000,
		earnedRewards: 0.125
	};
</script>

<Screen title="{pool} Stability Pool" subtitle="Deposit BOLD to earn {pool} from liquidations">
	<div class="pool-container">
		<div class="pool-stats">
			<div class="stat-card">
				<span class="stat-label">Your Deposit</span>
				<TokenAmount value={poolData.yourDeposit} symbol="BOLD" size="lg" />
			</div>
			<div class="stat-card">
				<span class="stat-label">Earned Rewards</span>
				<TokenAmount value={poolData.earnedRewards} symbol={pool} size="lg" />
			</div>
			<div class="stat-card">
				<span class="stat-label">Pool APR</span>
				<span class="apr"><Amount value={poolData.apr} decimals={1} suffix="%" size="lg" /></span>
			</div>
		</div>

		<div class="pool-actions">
			<Tabs {tabs} bind:active={activeTab} />

			{#if activeTab === 'deposit'}
				<div class="action-panel">
					<AmountInput
						bind:value={depositAmount}
						symbol="BOLD"
						label="Deposit Amount"
						maxValue="10000"
					/>
					<Button variant="primary" size="lg">Deposit BOLD</Button>
				</div>
			{:else if activeTab === 'claim'}
				<div class="action-panel">
					<div class="claim-info">
						<span class="claim-label">Available to Claim</span>
						<TokenAmount value={poolData.earnedRewards} symbol={pool} size="lg" />
					</div>
					<Button variant="primary" size="lg">Claim Rewards</Button>
				</div>
			{:else}
				<div class="action-panel">
					<div class="compound-info">
						<p>Compound your BOLD yield earnings back into your deposit to increase your earning power.</p>
					</div>
					<Button variant="primary" size="lg">Compound Yield</Button>
				</div>
			{/if}
		</div>
	</div>
</Screen>

<style>
	.pool-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-32);
		max-width: 480px;
	}

	.pool-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-16);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.apr {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--color-positive);
	}

	.pool-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.action-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.claim-info,
	.compound-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.claim-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.compound-info p {
		color: var(--color-content-alt);
		margin: 0;
	}
</style>
