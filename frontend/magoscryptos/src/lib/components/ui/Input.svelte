<script lang="ts">
	interface Props {
		value?: string;
		type?: 'text' | 'number' | 'email' | 'password';
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		readonly?: boolean;
		id?: string;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		label = '',
		error = '',
		disabled = false,
		readonly = false,
		id = '',
		oninput,
		onchange
	}: Props = $props();

	const inputId = $derived(id || `input-${Math.random().toString(36).substr(2, 9)}`);
</script>

<div class="input-wrapper" class:has-error={error}>
	{#if label}
		<label for={inputId} class="label">{label}</label>
	{/if}
	<input
		id={inputId}
		class="input"
		{type}
		{placeholder}
		{disabled}
		{readonly}
		bind:value
		{oninput}
		{onchange}
	/>
	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.input-wrapper {
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

	.input {
		width: 100%;
		padding: var(--space-12) var(--space-16);
		font-size: var(--text-base);
		color: var(--color-content);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast);
		outline: none;
	}

	.input::placeholder {
		color: var(--color-content-alt2);
	}

	.input:hover:not(:disabled) {
		border-color: var(--color-border-strong);
	}

	.input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
	}

	.input:disabled {
		background-color: var(--color-surface-secondary);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.input:read-only {
		background-color: var(--color-surface-secondary);
	}

	.has-error .input {
		border-color: var(--color-negative);
	}

	.has-error .input:focus {
		box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
	}

	.error {
		font-size: var(--text-sm);
		color: var(--color-negative);
	}
</style>
