<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		size?: Size;
		label?: string;
	}

	let { size = 'md', label }: Props = $props();
</script>

<div class="loading-spinner {size}" role="status" aria-label={label ?? 'Loading'}>
	<div class="spinner"></div>
	{#if label}
		<span class="label">{label}</span>
	{/if}
</div>

<style>
	.loading-spinner {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.spinner {
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	/* Sizes */
	.sm .spinner {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}

	.md .spinner {
		width: 24px;
		height: 24px;
		border-width: 2px;
	}

	.lg .spinner {
		width: 40px;
		height: 40px;
		border-width: 3px;
	}

	.label {
		font-size: var(--font-size-sm);
		color: var(--color-content-alt);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
