<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		onclick,
		children
	}: Props = $props();
</script>

<button
	class="button {variant} {size}"
	{type}
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-8);
		font-weight: var(--weight-medium);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		cursor: pointer;
		white-space: nowrap;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.sm {
		padding: var(--space-4) var(--space-12);
		font-size: var(--text-sm);
		height: 32px;
	}

	.md {
		padding: var(--space-8) var(--space-16);
		font-size: var(--text-base);
		height: 40px;
	}

	.lg {
		padding: var(--space-12) var(--space-24);
		font-size: var(--text-lg);
		height: 48px;
	}

	/* Variants */
	.primary {
		background-color: var(--color-primary);
		color: white;
	}

	.primary:hover:not(:disabled) {
		background-color: var(--color-primary-hover);
	}

	.primary:active:not(:disabled) {
		background-color: var(--color-primary-active);
	}

	.secondary {
		background-color: var(--color-surface-secondary);
		color: var(--color-content);
	}

	.secondary:hover:not(:disabled) {
		background-color: var(--color-surface-tertiary);
	}

	.tertiary {
		background-color: transparent;
		color: var(--color-primary);
	}

	.tertiary:hover:not(:disabled) {
		background-color: var(--color-surface-secondary);
	}

	.positive {
		background-color: var(--color-positive);
		color: white;
	}

	.positive:hover:not(:disabled) {
		filter: brightness(0.9);
	}

	.negative {
		background-color: var(--color-negative);
		color: white;
	}

	.negative:hover:not(:disabled) {
		filter: brightness(0.9);
	}
</style>
