<script lang="ts">
	import TokenIcon from '../ui/TokenIcon.svelte';

	interface Collateral {
		symbol: string;
		name: string;
		apr?: string;
		maxLtv?: string;
	}

	interface Props {
		collaterals?: Collateral[];
		value?: string;
		label?: string;
		disabled?: boolean;
		onchange?: (symbol: string) => void;
	}

	const defaultCollaterals: Collateral[] = [
		{ symbol: 'ETH', name: 'Ethereum', apr: '5.2%', maxLtv: '90.9%' },
		{ symbol: 'rETH', name: 'Rocket Pool ETH', apr: '4.8%', maxLtv: '83.3%' },
		{ symbol: 'wstETH', name: 'Lido Staked ETH', apr: '4.5%', maxLtv: '83.3%' }
	];

	let {
		collaterals = defaultCollaterals,
		value = $bindable('ETH'),
		label = 'Collateral',
		disabled = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let buttonRef: HTMLButtonElement;

	const selectedCollateral = $derived(collaterals.find(c => c.symbol === value));

	function toggle() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function select(collateral: Collateral) {
		value = collateral.symbol;
		isOpen = false;
		onchange?.(collateral.symbol);
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.collateral-selector')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="collateral-selector" class:disabled>
	{#if label}
		<span class="label">{label}</span>
	{/if}
	<button
		bind:this={buttonRef}
		class="trigger"
		class:open={isOpen}
		{disabled}
		onclick={toggle}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		{#if selectedCollateral}
			<div class="selected">
				<TokenIcon symbol={selectedCollateral.symbol} size="md" />
				<div class="info">
					<span class="name">{selectedCollateral.name}</span>
					<span class="symbol">{selectedCollateral.symbol}</span>
				</div>
			</div>
		{/if}
		<svg class="chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="5,8 10,13 15,8" />
		</svg>
	</button>

	{#if isOpen}
		<ul class="menu" role="listbox">
			{#each collaterals as collateral}
				<li>
					<button
						class="option"
						class:selected={collateral.symbol === value}
						onclick={() => select(collateral)}
						role="option"
						aria-selected={collateral.symbol === value}
					>
						<TokenIcon symbol={collateral.symbol} size="md" />
						<div class="option-info">
							<div class="option-main">
								<span class="option-name">{collateral.name}</span>
								<span class="option-symbol">{collateral.symbol}</span>
							</div>
							{#if collateral.apr || collateral.maxLtv}
								<div class="option-meta">
									{#if collateral.apr}
										<span>APR: {collateral.apr}</span>
									{/if}
									{#if collateral.maxLtv}
										<span>Max LTV: {collateral.maxLtv}</span>
									{/if}
								</div>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.collateral-selector {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content);
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-12);
		width: 100%;
		padding: var(--space-12) var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.trigger:hover:not(:disabled) {
		border-color: var(--color-border-strong);
	}

	.trigger:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.trigger:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.trigger.open {
		border-color: var(--color-primary);
	}

	.selected {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.name {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		color: var(--color-content);
	}

	.symbol {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.chevron {
		color: var(--color-content-alt);
		transition: transform var(--transition-fast);
	}

	.trigger.open .chevron {
		transform: rotate(180deg);
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: var(--space-4);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		z-index: var(--z-dropdown);
		overflow: hidden;
	}

	.option {
		display: flex;
		align-items: center;
		gap: var(--space-12);
		width: 100%;
		padding: var(--space-12) var(--space-16);
		text-align: left;
		transition: background-color var(--transition-fast);
	}

	.option:hover {
		background-color: var(--color-surface-secondary);
	}

	.option.selected {
		background-color: var(--color-surface-secondary);
	}

	.option-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.option-main {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	.option-name {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		color: var(--color-content);
	}

	.option-symbol {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.option-meta {
		display: flex;
		gap: var(--space-16);
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}
</style>
