<script lang="ts">
	interface Props {
		value: number | string;
		decimals?: number;
		prefix?: string;
		suffix?: string;
		compact?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		value,
		decimals = 2,
		prefix = '',
		suffix = '',
		compact = false,
		size = 'md'
	}: Props = $props();

	const numValue = $derived(typeof value === 'string' ? parseFloat(value) : value);

	const formattedValue = $derived(() => {
		if (isNaN(numValue)) return '—';

		if (compact) {
			if (numValue >= 1_000_000_000) {
				return (numValue / 1_000_000_000).toFixed(2) + 'B';
			}
			if (numValue >= 1_000_000) {
				return (numValue / 1_000_000).toFixed(2) + 'M';
			}
			if (numValue >= 1_000) {
				return (numValue / 1_000).toFixed(2) + 'K';
			}
		}

		return numValue.toLocaleString('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	});
</script>

<span class="amount {size}">
	{#if prefix}<span class="prefix">{prefix}</span>{/if}
	<span class="value">{formattedValue()}</span>
	{#if suffix}<span class="suffix">{suffix}</span>{/if}
</span>

<style>
	.amount {
		display: inline-flex;
		align-items: baseline;
		gap: 0.2em;
		font-variant-numeric: tabular-nums;
	}

	.sm {
		font-size: var(--text-sm);
	}

	.md {
		font-size: var(--text-base);
	}

	.lg {
		font-size: var(--text-lg);
	}

	.value {
		font-weight: var(--weight-medium);
	}

	.prefix,
	.suffix {
		color: var(--color-content-alt);
	}
</style>
