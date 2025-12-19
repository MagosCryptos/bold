<script lang="ts">
	interface Props {
		level: 'low' | 'medium' | 'high' | 'critical';
		showLabel?: boolean;
	}

	let {
		level,
		showLabel = true
	}: Props = $props();

	const labels: Record<typeof level, string> = {
		low: 'Low Risk',
		medium: 'Medium Risk',
		high: 'High Risk',
		critical: 'Critical'
	};
</script>

<div class="risk-badge {level}">
	<span class="dot"></span>
	{#if showLabel}
		<span class="label">{labels[level]}</span>
	{/if}
</div>

<style>
	.risk-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-8);
		padding: var(--space-4) var(--space-12);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.low {
		background-color: var(--color-positive-surface);
		color: var(--color-positive);
	}

	.low .dot {
		background-color: var(--color-positive);
	}

	.medium {
		background-color: var(--color-warning-surface);
		color: var(--color-warning);
	}

	.medium .dot {
		background-color: var(--color-warning);
	}

	.high {
		background-color: var(--color-negative-surface);
		color: var(--color-negative);
	}

	.high .dot {
		background-color: var(--color-negative);
	}

	.critical {
		background-color: var(--color-negative);
		color: white;
	}

	.critical .dot {
		background-color: white;
	}
</style>
