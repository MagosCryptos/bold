<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button, Tabs, TokenIcon } from '$lib/components/ui';

	let activeTab = $state('stake');
	let stakeAmount = $state('');

	const tabs = [
		{ id: 'stake', label: 'Stake' },
		{ id: 'rewards', label: 'Rewards' },
		{ id: 'voting', label: 'Voting' }
	];

	// Mock data
	const stakeData = {
		stakedAmount: 10000,
		votingPower: 10000,
		earnedBold: 125.5,
		earnedEth: 0.05
	};
</script>

<Screen title="Stake LQTY" subtitle="Stake LQTY to earn protocol fees and vote on governance">
	<div class="stake-container">
		<div class="stake-stats">
			<div class="stat-card">
				<span class="stat-label">Your Stake</span>
				<TokenAmount value={stakeData.stakedAmount} symbol="LQTY" size="lg" />
			</div>
			<div class="stat-card">
				<span class="stat-label">Voting Power</span>
				<span class="voting-power"><Amount value={stakeData.votingPower} decimals={0} size="lg" /></span>
			</div>
			<div class="stat-card">
				<span class="stat-label">Earned BOLD</span>
				<TokenAmount value={stakeData.earnedBold} symbol="BOLD" size="lg" />
			</div>
		</div>

		<div class="stake-actions">
			<Tabs {tabs} bind:active={activeTab} />

			{#if activeTab === 'stake'}
				<div class="action-panel">
					<AmountInput
						bind:value={stakeAmount}
						symbol="LQTY"
						label="Stake Amount"
						maxValue="50000"
					/>
					<div class="button-group">
						<Button variant="primary" size="lg">Stake LQTY</Button>
						<Button variant="secondary" size="lg">Unstake</Button>
					</div>
				</div>
			{:else if activeTab === 'rewards'}
				<div class="action-panel">
					<div class="rewards-list">
						<div class="reward-item">
							<span class="reward-label">BOLD Rewards</span>
							<TokenAmount value={stakeData.earnedBold} symbol="BOLD" />
						</div>
						<div class="reward-item">
							<span class="reward-label">ETH Rewards</span>
							<TokenAmount value={stakeData.earnedEth} symbol="ETH" />
						</div>
					</div>
					<Button variant="primary" size="lg">Claim All Rewards</Button>
				</div>
			{:else}
				<div class="action-panel">
					<div class="voting-info">
						<h3>Governance Voting</h3>
						<p>Allocate your voting power to initiatives to earn additional rewards.</p>
					</div>
					<div class="initiatives">
						<div class="initiative">
							<span class="initiative-name">Liquidity Mining Initiative</span>
							<span class="initiative-votes">45% of votes</span>
						</div>
						<div class="initiative">
							<span class="initiative-name">Treasury Allocation</span>
							<span class="initiative-votes">32% of votes</span>
						</div>
						<div class="initiative">
							<span class="initiative-name">Protocol Upgrade</span>
							<span class="initiative-votes">23% of votes</span>
						</div>
					</div>
					<Button variant="primary" size="lg">Allocate Votes</Button>
				</div>
			{/if}
		</div>
	</div>
</Screen>

<style>
	.stake-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-32);
		max-width: 480px;
	}

	.stake-stats {
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

	.voting-power {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: #745DDF;
	}

	.stake-actions {
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

	.button-group {
		display: flex;
		gap: var(--space-12);
	}

	.rewards-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.reward-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-16);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.reward-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.voting-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.voting-info h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.voting-info p {
		margin: 0;
		color: var(--color-content-alt);
	}

	.initiatives {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	.initiative {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-16);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.initiative-name {
		font-weight: var(--weight-medium);
	}

	.initiative-votes {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}
</style>
