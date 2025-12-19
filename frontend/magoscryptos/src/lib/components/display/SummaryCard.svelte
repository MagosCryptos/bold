<script lang="ts">
	import type { Snippet } from 'svelte';

	type SummaryItem = {
		label: string;
		value: Snippet;
		secondary?: string;
		highlight?: boolean;
		fullWidth?: boolean;
	};

	type Props = {
		title: string;
		description?: string;
		items?: SummaryItem[];
		children?: Snippet;
		columns?: 1 | 2 | 3 | 4;
	};

	let {
		title,
		description = '',
		items = [],
		children,
		columns = 2
	}: Props = $props();
</script>

<div class="summary-card">
	<div class="header">
		<h3 class="title">{title}</h3>
		{#if description}
			<p class="description">{description}</p>
		{/if}
	</div>

	{#if items.length > 0}
		<div class="grid columns-{columns}">
			{#each items as item}
				<div class="item" class:highlight={item.highlight} class:full-width={item.fullWidth}>
					<span class="item-label">{item.label}</span>
					<span class="item-value">
						{@render item.value()}
					</span>
					{#if item.secondary}
						<span class="item-secondary">{item.secondary}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if children}
		<div class="content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.summary-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.description {
		color: var(--color-content-alt);
		margin: 0;
		font-size: var(--text-sm);
	}

	.grid {
		display: grid;
		gap: var(--space-16);
	}

	.grid.columns-1 {
		grid-template-columns: 1fr;
	}

	.grid.columns-2 {
		grid-template-columns: repeat(2, 1fr);
	}

	.grid.columns-3 {
		grid-template-columns: repeat(3, 1fr);
	}

	.grid.columns-4 {
		grid-template-columns: repeat(4, 1fr);
	}

	.item {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.item.highlight {
		grid-column: 1 / -1;
		padding: var(--space-16);
		background-color: rgba(75, 110, 245, 0.1);
		border-radius: var(--radius-md);
	}

	.item.full-width {
		grid-column: 1 / -1;
	}

	.item-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.item-value {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.item-secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	@media (max-width: 768px) {
		.grid.columns-3,
		.grid.columns-4 {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
