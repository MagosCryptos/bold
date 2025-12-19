<script lang="ts">
	interface Props {
		value?: string;
		mode?: 'manual' | 'delegate';
		delegateAddress?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		onchange?: (value: string) => void;
		onmodechange?: (mode: 'manual' | 'delegate') => void;
	}

	let {
		value = $bindable(''),
		mode = $bindable<'manual' | 'delegate'>('manual'),
		delegateAddress = '',
		label = 'Interest Rate',
		error = '',
		disabled = false,
		onchange,
		onmodechange
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}

	function setMode(newMode: 'manual' | 'delegate') {
		mode = newMode;
		onmodechange?.(newMode);
	}
</script>

<div class="interest-rate-field" class:has-error={error}>
	<div class="header">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="label">{label}</label>
		<div class="mode-toggle">
			<button
				type="button"
				class="mode-button"
				class:active={mode === 'manual'}
				onclick={() => setMode('manual')}
			>
				Manual
			</button>
			<button
				type="button"
				class="mode-button"
				class:active={mode === 'delegate'}
				onclick={() => setMode('delegate')}
			>
				Delegate
			</button>
		</div>
	</div>

	{#if mode === 'manual'}
		<div class="input-container">
			<input
				type="text"
				inputmode="decimal"
				class="input"
				placeholder="0.00"
				{disabled}
				{value}
				oninput={handleInput}
			/>
			<span class="suffix">%</span>
		</div>
		<p class="hint">Set your annual interest rate. Higher rates provide more protection from redemptions.</p>
	{:else}
		<div class="delegate-info">
			{#if delegateAddress}
				<p class="delegate-address">Managed by: {delegateAddress}</p>
			{:else}
				<p class="delegate-placeholder">Select a delegate to manage your interest rate</p>
			{/if}
		</div>
	{/if}

	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.interest-rate-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		width: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-16);
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content);
	}

	.mode-toggle {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-4);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.mode-button {
		padding: var(--space-4) var(--space-12);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.mode-button:hover {
		color: var(--color-content);
	}

	.mode-button.active {
		background-color: var(--color-surface);
		color: var(--color-content);
		box-shadow: var(--shadow-sm);
	}

	.input-container {
		display: flex;
		align-items: center;
		gap: var(--space-8);
		padding: var(--space-16);
		background-color: var(--color-surface-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--transition-fast);
	}

	.input-container:focus-within {
		border-color: var(--color-primary);
	}

	.has-error .input-container {
		border-color: var(--color-negative);
	}

	.input {
		flex: 1;
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		color: var(--color-content);
		background: transparent;
		border: none;
		outline: none;
		min-width: 0;
		text-align: right;
	}

	.input::placeholder {
		color: var(--color-content-alt2);
	}

	.input:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.suffix {
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		margin: 0;
	}

	.delegate-info {
		padding: var(--space-16);
		background-color: var(--color-surface-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.delegate-address {
		font-size: var(--text-sm);
		font-family: var(--font-mono);
		color: var(--color-content);
		margin: 0;
	}

	.delegate-placeholder {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		margin: 0;
	}

	.error {
		font-size: var(--text-sm);
		color: var(--color-negative);
	}
</style>
