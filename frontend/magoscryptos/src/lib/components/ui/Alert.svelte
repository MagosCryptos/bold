<script lang="ts">
	import type { Snippet } from 'svelte';

	type AlertVariant = 'info' | 'warning' | 'error' | 'success';

	type Props = {
		variant?: AlertVariant;
		title?: string;
		children: Snippet;
	};

	let {
		variant = 'info',
		title = '',
		children
	}: Props = $props();
</script>

<div class="alert {variant}">
	{#if title}
		<strong class="alert-title">{title}</strong>
	{/if}
	<div class="alert-content">
		{@render children()}
	</div>
</div>

<style>
	.alert {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-16);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.alert-title {
		font-weight: var(--weight-semibold);
	}

	.alert-content {
		line-height: 1.5;
	}

	.alert-content :global(ul) {
		margin: var(--space-8) 0 0 0;
		padding-left: var(--space-16);
	}

	.alert-content :global(li) {
		margin-bottom: var(--space-4);
	}

	.alert-content :global(li:last-child) {
		margin-bottom: 0;
	}

	/* Info variant */
	.alert.info {
		background-color: var(--color-info-surface);
		border: 1px solid var(--color-info);
		color: var(--color-info);
	}

	/* Warning variant */
	.alert.warning {
		background-color: var(--color-warning-surface);
		border: 1px solid var(--color-warning);
		color: var(--color-warning);
	}

	/* Error variant */
	.alert.error {
		background-color: var(--color-error-surface);
		border: 1px solid var(--color-error);
		color: var(--color-error);
	}

	/* Success variant */
	.alert.success {
		background-color: var(--color-success-surface);
		border: 1px solid var(--color-success);
		color: var(--color-success);
	}
</style>
