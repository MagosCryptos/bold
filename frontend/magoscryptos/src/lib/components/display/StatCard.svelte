<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		children: Snippet;
		secondary?: string;
		highlight?: boolean;
	};

	let {
		label,
		children,
		secondary = '',
		highlight = false
	}: Props = $props();
</script>

<div class="stat-card" class:highlight>
	<span class="label">{label}</span>
	<div class="value">
		{@render children()}
	</div>
	{#if secondary}
		<span class="secondary">{secondary}</span>
	{/if}
</div>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.stat-card.highlight {
		background-color: rgba(75, 110, 245, 0.1);
		border-color: rgba(75, 110, 245, 0.3);
	}

	.label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}
</style>
