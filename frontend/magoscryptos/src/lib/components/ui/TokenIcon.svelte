<script lang="ts">
	interface Props {
		symbol: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		symbol,
		size = 'md'
	}: Props = $props();

	const sizeMap = {
		sm: 20,
		md: 32,
		lg: 48
	};

	const iconSize = $derived(sizeMap[size]);

	// Token color mapping for fallback display
	const tokenColors: Record<string, string> = {
		ETH: '#627EEA',
		WETH: '#627EEA',
		rETH: '#F6851B',
		wstETH: '#00A3FF',
		BOLD: '#4B6EF5',
		LQTY: '#745DDF'
	};

	const backgroundColor = $derived(tokenColors[symbol] ?? '#8E8E93');
</script>

<div
	class="token-icon {size}"
	style="--icon-size: {iconSize}px; --bg-color: {backgroundColor}"
	title={symbol}
>
	<span class="symbol">{symbol.charAt(0)}</span>
</div>

<style>
	.token-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--icon-size);
		height: var(--icon-size);
		background-color: var(--bg-color);
		border-radius: 50%;
		color: white;
		font-weight: var(--weight-bold);
	}

	.sm .symbol {
		font-size: 10px;
	}

	.md .symbol {
		font-size: 14px;
	}

	.lg .symbol {
		font-size: 20px;
	}
</style>
