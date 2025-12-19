<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { TokenAmount } from '$lib/components/display';
	import { Button, TokenIcon } from '$lib/components/ui';

	// Mock data
	const walletAddress = '0x1234...5678';
	const balances = [
		{ symbol: 'ETH', name: 'Ethereum', balance: 10.5 },
		{ symbol: 'rETH', name: 'Rocket Pool ETH', balance: 5.2 },
		{ symbol: 'wstETH', name: 'Lido Staked ETH', balance: 3.8 },
		{ symbol: 'BOLD', name: 'BOLD Stablecoin', balance: 15000 },
		{ symbol: 'LQTY', name: 'LQTY Token', balance: 50000 }
	];
</script>

<Screen title="Account" subtitle="Manage your wallet and balances">
	<div class="account-container">
		<!-- Wallet Info -->
		<div class="wallet-card">
			<div class="wallet-header">
				<span class="wallet-label">Connected Wallet</span>
				<Button variant="tertiary" size="sm">Disconnect</Button>
			</div>
			<div class="wallet-address">{walletAddress}</div>
		</div>

		<!-- Balances -->
		<div class="balances-section">
			<h2 class="section-title">Token Balances</h2>
			<div class="balances-list">
				{#each balances as token}
					<div class="balance-item">
						<div class="token-info">
							<TokenIcon symbol={token.symbol} size="md" />
							<div class="token-names">
								<span class="token-name">{token.name}</span>
								<span class="token-symbol">{token.symbol}</span>
							</div>
						</div>
						<TokenAmount value={token.balance} symbol={token.symbol} showIcon={false} />
					</div>
				{/each}
			</div>
		</div>

		<!-- Faucet (Testnet only) -->
		<div class="faucet-section">
			<h2 class="section-title">Testnet Faucet</h2>
			<p class="faucet-description">Get test tokens for development and testing.</p>
			<div class="faucet-buttons">
				<Button variant="secondary">Get Test ETH</Button>
				<Button variant="secondary">Get Test BOLD</Button>
				<Button variant="secondary">Get Test LQTY</Button>
			</div>
		</div>
	</div>
</Screen>

<style>
	.account-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-32);
		max-width: 480px;
	}

	.wallet-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.wallet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wallet-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.wallet-address {
		font-family: var(--font-mono);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
	}

	.balances-section,
	.faucet-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.section-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.balances-list {
		display: flex;
		flex-direction: column;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.balance-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-16);
		border-bottom: 1px solid var(--color-border);
	}

	.balance-item:last-child {
		border-bottom: none;
	}

	.token-info {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	.token-names {
		display: flex;
		flex-direction: column;
	}

	.token-name {
		font-weight: var(--weight-medium);
	}

	.token-symbol {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.faucet-description {
		color: var(--color-content-alt);
		margin: 0;
	}

	.faucet-buttons {
		display: flex;
		gap: var(--space-12);
		flex-wrap: wrap;
	}
</style>
