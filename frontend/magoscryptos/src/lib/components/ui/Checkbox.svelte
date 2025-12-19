<script lang="ts">
	type Props = {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	};

	let {
		checked = $bindable(false),
		label = '',
		disabled = false,
		onchange
	}: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(checked);
	}
</script>

<label class="checkbox" class:disabled>
	<input
		type="checkbox"
		bind:checked
		{disabled}
		onchange={handleChange}
	/>
	<span class="checkmark"></span>
	{#if label}
		<span class="label">{label}</span>
	{/if}
</label>

<style>
	.checkbox {
		display: flex;
		align-items: flex-start;
		gap: var(--space-12);
		cursor: pointer;
		user-select: none;
	}

	.checkbox.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.checkbox input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkmark {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface);
		transition: all var(--transition-fast);
		position: relative;
	}

	.checkbox:hover:not(.disabled) .checkmark {
		border-color: var(--color-primary);
	}

	.checkbox input:checked + .checkmark {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.checkbox input:checked + .checkmark::after {
		content: '';
		position: absolute;
		left: 6px;
		top: 2px;
		width: 5px;
		height: 10px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.checkbox input:focus-visible + .checkmark {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.label {
		font-size: var(--text-sm);
		color: var(--color-content);
		line-height: 1.4;
	}
</style>
