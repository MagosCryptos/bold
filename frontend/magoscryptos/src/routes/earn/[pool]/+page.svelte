<script lang="ts">
	import { page } from '$app/stores';
	import { Screen } from '$lib/components/layout';
	import { AmountInput } from '$lib/components/forms';
	import { Amount, TokenAmount } from '$lib/components/display';
	import { Button, Tabs, TokenIcon } from '$lib/components/ui';
	import { TxModal } from '$lib/components/transactions';
	import { wallet, positions } from '$lib/stores';
	import {
		txContext,
		getEarnDepositFlowDefinition,
		getEarnWithdrawFlowDefinition,
		getEarnClaimFlowDefinition,
		type EarnDepositRequest,
		type EarnWithdrawRequest
	} from '$lib/transactions';
	import { parseEther } from 'viem';

	const pool = $derived($page.params.pool?.toUpperCase() ?? 'ETH');

	// Map pool symbol to branch ID
	const BRANCH_IDS: Record<string, number> = { ETH: 0, WSTETH: 1, RETH: 2 };
	const branchId = $derived(BRANCH_IDS[pool] ?? 0);

	let activeTab = $state('deposit');
	let depositAmount = $state('');
	let withdrawAmount = $state('');
	let isSubmitting = $state(false);

	const tabs = [
		{ id: 'deposit', label: 'Deposit' },
		{ id: 'withdraw', label: 'Withdraw' },
		{ id: 'claim', label: 'Claim' }
	];

	// Get real position data if available
	const userPosition = $derived(
		positions.positions.find((p) => p.symbol === pool)
	);
	const poolData = $derived({
		apr: 8.5, // TODO: Get from subgraph
		tvl: '45.2M', // TODO: Get from pools store
		yourDeposit: userPosition?.deposited ?? 0,
		earnedRewards: userPosition?.rewards ?? 0
	});

	// Validation
	const isValidDeposit = $derived(
		wallet.isConnected && parseFloat(depositAmount) > 0
	);
	const isValidWithdraw = $derived(
		wallet.isConnected &&
		parseFloat(withdrawAmount) > 0 &&
		parseFloat(withdrawAmount) <= poolData.yourDeposit
	);
	const hasRewards = $derived(poolData.earnedRewards > 0);

	async function handleDeposit() {
		if (!wallet.address || !isValidDeposit) return;

		isSubmitting = true;
		try {
			const request: EarnDepositRequest = {
				flowId: 'earnDeposit',
				account: wallet.address,
				branchId,
				amount: parseEther(depositAmount)
			};
			const flowDef = getEarnDepositFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
			depositAmount = '';
		} catch (error) {
			console.error('Failed to start deposit flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleWithdraw() {
		if (!wallet.address || !isValidWithdraw) return;

		isSubmitting = true;
		try {
			const request: EarnWithdrawRequest = {
				flowId: 'earnWithdraw',
				account: wallet.address,
				branchId,
				amount: parseEther(withdrawAmount),
				claimRewards: false
			};
			const flowDef = getEarnWithdrawFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
			withdrawAmount = '';
		} catch (error) {
			console.error('Failed to start withdraw flow:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleClaim() {
		if (!wallet.address || !hasRewards) return;

		isSubmitting = true;
		try {
			const request: EarnWithdrawRequest = {
				flowId: 'earnWithdraw',
				account: wallet.address,
				branchId,
				amount: 0n,
				claimRewards: true
			};
			const flowDef = getEarnClaimFlowDefinition(request);
			await txContext.startFlow(request, flowDef);
		} catch (error) {
			console.error('Failed to start claim flow:', error);
		} finally {
			isSubmitting = false;
		}
	}
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
					{#if !wallet.isConnected}
						<Button variant="primary" size="lg" onclick={() => wallet.connect()}>
							Connect Wallet
						</Button>
					{:else}
						<Button
							variant="primary"
							size="lg"
							onclick={handleDeposit}
							disabled={!isValidDeposit || isSubmitting}
						>
							{isSubmitting ? 'Processing...' : 'Deposit BOLD'}
						</Button>
					{/if}
				</div>
			{:else if activeTab === 'withdraw'}
				<div class="action-panel">
					<AmountInput
						bind:value={withdrawAmount}
						symbol="BOLD"
						label="Withdraw Amount"
						maxValue={poolData.yourDeposit.toString()}
					/>
					{#if !wallet.isConnected}
						<Button variant="primary" size="lg" onclick={() => wallet.connect()}>
							Connect Wallet
						</Button>
					{:else}
						<Button
							variant="primary"
							size="lg"
							onclick={handleWithdraw}
							disabled={!isValidWithdraw || isSubmitting}
						>
							{isSubmitting ? 'Processing...' : 'Withdraw BOLD'}
						</Button>
					{/if}
				</div>
			{:else if activeTab === 'claim'}
				<div class="action-panel">
					<div class="claim-info">
						<span class="claim-label">Available to Claim</span>
						<TokenAmount value={poolData.earnedRewards} symbol={pool} size="lg" />
					</div>
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
							{isSubmitting ? 'Processing...' : 'Claim Rewards'}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Transaction Modal -->
	<TxModal />
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
