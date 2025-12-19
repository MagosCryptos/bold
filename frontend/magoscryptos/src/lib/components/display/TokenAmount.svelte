<script lang="ts">
	import TokenIcon from '../ui/TokenIcon.svelte';
	import Amount from './Amount.svelte';

	interface Props {
		value: number | string;
		symbol: string;
		decimals?: number;
		showIcon?: boolean;
		size?: 'sm' | 'md' | 'lg';
		secondaryValue?: string;
	}

	let {
		value,
		symbol,
		decimals = 4,
		showIcon = true,
		size = 'md',
		secondaryValue = ''
	}: Props = $props();

	const iconSize = $derived(size === 'lg' ? 'md' : 'sm');
</script>

<div class="token-amount {size}">
	<div class="main">
		{#if showIcon}
			<TokenIcon {symbol} size={iconSize} />
		{/if}
		<Amount {value} {decimals} {size} />
		<span class="symbol">{symbol}</span>
	</div>
	{#if secondaryValue}
		<span class="secondary">{secondaryValue}</span>
	{/if}
</div>

<style>
	.token-amount {
		display: inline-flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.main {
		display: inline-flex;
		align-items: center;
		gap: var(--space-8);
	}

	.symbol {
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
	}

	.sm .symbol {
		font-size: var(--text-sm);
	}

	.md .symbol {
		font-size: var(--text-base);
	}

	.lg .symbol {
		font-size: var(--text-lg);
	}

	.secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}
</style>
