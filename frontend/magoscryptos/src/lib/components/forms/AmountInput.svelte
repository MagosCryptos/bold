<script lang="ts">
	import TokenIcon from '../ui/TokenIcon.svelte';

	interface Props {
		value?: string;
		symbol: string;
		label?: string;
		secondaryValue?: string;
		maxValue?: string;
		placeholder?: string;
		error?: string;
		disabled?: boolean;
		onchange?: (value: string) => void;
		onmax?: () => void;
	}

	let {
		value = $bindable(''),
		symbol,
		label = '',
		secondaryValue = '',
		maxValue = '',
		placeholder = '0.00',
		error = '',
		disabled = false,
		onchange,
		onmax
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}

	function handleMax() {
		if (maxValue) {
			value = maxValue;
			onchange?.(maxValue);
		}
		onmax?.();
	}
</script>

<div class="amount-input" class:has-error={error}>
	{#if label}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="label">{label}</label>
	{/if}
	<div class="input-container">
		<div class="input-row">
			<input
				type="text"
				inputmode="decimal"
				class="input"
				{placeholder}
				{disabled}
				{value}
				oninput={handleInput}
			/>
			<div class="token">
				<TokenIcon {symbol} size="sm" />
				<span class="symbol">{symbol}</span>
			</div>
		</div>
		<div class="footer">
			{#if secondaryValue}
				<span class="secondary">{secondaryValue}</span>
			{:else}
				<span></span>
			{/if}
			{#if maxValue}
				<button type="button" class="max-button" onclick={handleMax} {disabled}>
					Max
				</button>
			{/if}
		</div>
	</div>
	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.amount-input {
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

	.input-container {
		display: flex;
		flex-direction: column;
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

	.input-row {
		display: flex;
		align-items: center;
		gap: var(--space-12);
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
	}

	.input::placeholder {
		color: var(--color-content-alt2);
	}

	.input:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.token {
		display: flex;
		align-items: center;
		gap: var(--space-8);
		padding: var(--space-8) var(--space-12);
		background-color: var(--color-surface);
		border-radius: var(--radius-full);
	}

	.symbol {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content);
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--space-8);
	}

	.secondary {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.max-button {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-primary);
		padding: var(--space-4) var(--space-8);
		border-radius: var(--radius-sm);
		transition: background-color var(--transition-fast);
	}

	.max-button:hover:not(:disabled) {
		background-color: var(--color-surface);
	}

	.max-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		font-size: var(--text-sm);
		color: var(--color-negative);
	}
</style>
