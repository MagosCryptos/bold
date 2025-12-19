<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button } from '$lib/components/ui';
	import { TxModal } from '$lib/components/transactions';
	import { wallet } from '$lib/stores';
	import {
		txContext,
		getStakeLqtyFlowDefinition,
		getUnstakeLqtyFlowDefinition,
		getClaimStakingRewardsFlowDefinition,
		type StakeLqtyRequest,
		type UnstakeLqtyRequest,
		type ClaimStakingRewardsRequest
	} from '$lib/transactions';
	import { parseEther } from 'viem';

	const action = $derived($page.params.action ?? 'stake');

	// Form state
	let amount = $state('');
	let isSubmitting = $state(false);

	// Mock data - TODO: Get from contract/subgraph
	const stakeData = {
		stakedAmount: 10000,
		availableBalance: 50000,
		votingPower: 10000,
		earnedBold: 125.5,
		earnedEth: 0.05,
		currentApr: 8.5
	};

	const isStake = $derived(action === 'stake');
	const isUnstake = $derived(action === 'unstake');
	const isClaim = $derived(action === 'claim');
	const isVote = $derived(action === 'vote');

	const maxAmount = $derived(
		isStake ? stakeData.availableBalance.toString() :
		isUnstake ? stakeData.stakedAmount.toString() :
		'0'
	);

	const title = $derived(
		isStake ? 'Stake LQTY' :
		isUnstake ? 'Unstake LQTY' :
		isClaim ? 'Claim Rewards' :
		isVote ? 'Allocate Votes' :
		'Stake Action'
	);

	const subtitle = $derived(
		isStake ? 'Stake LQTY tokens to earn protocol fees and gain voting power' :
		isUnstake ? 'Withdraw your staked LQTY tokens' :
		isClaim ? 'Claim your earned rewards' :
		isVote ? 'Allocate your voting power to initiatives' :
		''
	);

	// Validation
	const isValidAmount = $derived(parseFloat(amount) > 0);
	const isValidStake = $derived(
		wallet.isConnected && isValidAmount && parseFloat(amount) <= stakeData.availableBalance
	);
	const isValidUnstake = $derived(
		wallet.isConnected && isValidAmount && parseFloat(amount) <= stakeData.stakedAmount
	);
	const hasRewards = $derived(stakeData.earnedBold > 0 || stakeData.earnedEth > 0);

	async function handleStake(e: Event) {
		e.preventDefault();
		if (!wallet.address || !isValidStake) return;

		isSubmitting = true;
		try {
			const request: StakeLqtyRequest = {
				flowId: 'stakeLqty',
				account: wallet.address,
				amount: parseEther(amount)
			};
			const flowDef = getStakeLqtyFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
			amount = '';
		} catch (error) {
			console.error('Failed to start stake flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleUnstake(e: Event) {
		e.preventDefault();
		if (!wallet.address || !isValidUnstake) return;

		isSubmitting = true;
		try {
			const request: UnstakeLqtyRequest = {
				flowId: 'unstakeLqty',
				account: wallet.address,
				amount: parseEther(amount)
			};
			const flowDef = getUnstakeLqtyFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
			amount = '';
		} catch (error) {
			console.error('Failed to start unstake flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleClaim() {
		if (!wallet.address || !hasRewards) return;

		isSubmitting = true;
		try {
			const request: ClaimStakingRewardsRequest = {
				flowId: 'claimStakingRewards',
				account: wallet.address
			};
			const flowDef = getClaimStakingRewardsFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
		} catch (error) {
			console.error('Failed to start claim flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleSubmit(e: Event) {
		if (isStake) {
			handleStake(e);
		} else if (isUnstake) {
			handleUnstake(e);
		}
	}
</script>

<Screen {title} {subtitle}>
	<div class="action-container">
		{#if isStake || isUnstake}
			<form class="action-form" onsubmit={handleSubmit}>
				<!-- Current Stats -->
				<div class="stats-row">
					<div class="stat">
						<span class="stat-label">Currently Staked</span>
						<TokenAmount value={stakeData.stakedAmount} symbol="LQTY" />
					</div>
					<div class="stat">
						<span class="stat-label">Available Balance</span>
						<TokenAmount value={stakeData.availableBalance} symbol="LQTY" />
					</div>
				</div>

				<!-- Amount Input -->
				<AmountInput
					bind:value={amount}
					symbol="LQTY"
					label={isStake ? 'Amount to Stake' : 'Amount to Unstake'}
					maxValue={maxAmount}
					placeholder="0.00"
				/>

				<!-- Preview -->
				<div class="preview">
					<h3 class="preview-title">After {isStake ? 'Staking' : 'Unstaking'}</h3>
					<div class="preview-grid">
						<div class="preview-item">
							<span class="preview-label">New Staked Balance</span>
							<span class="preview-value">
								{#if isStake}
									<Amount value={stakeData.stakedAmount + (parseFloat(amount) || 0)} decimals={0} suffix=" LQTY" />
								{:else}
									<Amount value={Math.max(0, stakeData.stakedAmount - (parseFloat(amount) || 0))} decimals={0} suffix=" LQTY" />
								{/if}
							</span>
						</div>
						<div class="preview-item">
							<span class="preview-label">New Voting Power</span>
							<span class="preview-value">
								{#if isStake}
									<Amount value={stakeData.votingPower + (parseFloat(amount) || 0)} decimals={0} />
								{:else}
									<Amount value={Math.max(0, stakeData.votingPower - (parseFloat(amount) || 0))} decimals={0} />
								{/if}
							</span>
						</div>
					</div>
				</div>

				{#if !wallet.isConnected}
					<Button type="button" variant="primary" size="lg" onclick={() => wallet.connect()}>
						Connect Wallet
					</Button>
				{:else}
					<Button
						type="submit"
						variant={isStake ? 'primary' : 'secondary'}
						size="lg"
						disabled={(isStake ? !isValidStake : !isValidUnstake) || isSubmitting}
					>
						{isSubmitting ? 'Processing...' : isStake ? 'Stake LQTY' : 'Unstake LQTY'}
					</Button>
				{/if}
			</form>

		{:else if isClaim}
			<div class="claim-panel">
				<h3>Your Rewards</h3>
				<div class="rewards-list">
					<div class="reward-item">
						<div class="reward-info">
							<span class="reward-label">BOLD Rewards</span>
							<span class="reward-description">From stability pool fees</span>
						</div>
						<TokenAmount value={stakeData.earnedBold} symbol="BOLD" size="lg" />
					</div>
					<div class="reward-item">
						<div class="reward-info">
							<span class="reward-label">ETH Rewards</span>
							<span class="reward-description">From liquidation proceeds</span>
						</div>
						<TokenAmount value={stakeData.earnedEth} symbol="ETH" size="lg" />
					</div>
				</div>

				<div class="claim-actions">
					{#if !wallet.isConnected}
						<Button variant="primary" size="lg" onclick={() => wallet.connect()}>
							Connect Wallet
						</Button>
					{:else}
						<Button
							variant="primary"
							size="lg"
							onclick={handleClaim}
							disabled={!hasRewards || isSubmitting}
						>
							{isSubmitting ? 'Processing...' : 'Claim All Rewards'}
						</Button>
					{/if}
					<p class="claim-note">Rewards will be sent to your connected wallet</p>
				</div>
			</div>

		{:else if isVote}
			<div class="vote-panel">
				<div class="voting-power-display">
					<span class="voting-label">Your Voting Power</span>
					<span class="voting-value"><Amount value={stakeData.votingPower} decimals={0} /></span>
				</div>

				<h3>Active Initiatives</h3>
				<div class="initiatives-list">
					<div class="initiative-card">
						<div class="initiative-header">
							<span class="initiative-name">Liquidity Mining Initiative</span>
							<span class="initiative-percent">45%</span>
						</div>
						<div class="initiative-bar">
							<div class="initiative-progress" style="width: 45%"></div>
						</div>
						<p class="initiative-description">
							Allocate rewards to incentivize liquidity provision across DEXs.
						</p>
						<input type="number" class="vote-input" placeholder="0" min="0" max={stakeData.votingPower} />
					</div>

					<div class="initiative-card">
						<div class="initiative-header">
							<span class="initiative-name">Treasury Allocation</span>
							<span class="initiative-percent">32%</span>
						</div>
						<div class="initiative-bar">
							<div class="initiative-progress" style="width: 32%"></div>
						</div>
						<p class="initiative-description">
							Fund protocol development and operations.
						</p>
						<input type="number" class="vote-input" placeholder="0" min="0" max={stakeData.votingPower} />
					</div>

					<div class="initiative-card">
						<div class="initiative-header">
							<span class="initiative-name">Protocol Upgrade</span>
							<span class="initiative-percent">23%</span>
						</div>
						<div class="initiative-bar">
							<div class="initiative-progress" style="width: 23%"></div>
						</div>
						<p class="initiative-description">
							Support the next major protocol upgrade.
						</p>
						<input type="number" class="vote-input" placeholder="0" min="0" max={stakeData.votingPower} />
					</div>
				</div>

				<Button variant="primary" size="lg" onclick={handleSubmit}>
					Submit Votes
				</Button>
			</div>
		{:else}
			<p>Unknown action: {action}</p>
			<a href="/stake">Go back to Stake</a>
		{/if}
	</div>

	<!-- Transaction Modal -->
	<TxModal />
</Screen>

<style>
	.action-container {
		max-width: 480px;
	}

	.action-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.stats-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-16);
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.preview-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-16);
	}

	.preview-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.preview-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.preview-value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	/* Claim Panel */
	.claim-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.claim-panel h3 {
		margin: 0;
		font-size: var(--text-xl);
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
		padding: var(--space-20);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.reward-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.reward-label {
		font-weight: var(--weight-semibold);
	}

	.reward-description {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.claim-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		align-items: center;
	}

	.claim-note {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		margin: 0;
	}

	/* Vote Panel */
	.vote-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.voting-power-display {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-20);
		background-color: rgba(116, 93, 223, 0.1);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.voting-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.voting-value {
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		color: #745DDF;
	}

	.vote-panel h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.initiatives-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.initiative-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		padding: var(--space-20);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.initiative-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.initiative-name {
		font-weight: var(--weight-semibold);
	}

	.initiative-percent {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.initiative-bar {
		height: 8px;
		background-color: var(--color-surface-secondary);
		border-radius: 4px;
		overflow: hidden;
	}

	.initiative-progress {
		height: 100%;
		background-color: var(--color-primary);
		border-radius: 4px;
	}

	.initiative-description {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		margin: 0;
	}

	.vote-input {
		padding: var(--space-12);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		background-color: var(--color-surface);
	}

	.vote-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}
</style>
