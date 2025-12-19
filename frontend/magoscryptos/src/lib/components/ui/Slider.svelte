<script lang="ts">
	type Props = {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		valueLabel?: string;
		showRange?: boolean;
		minLabel?: string;
		maxLabel?: string;
		disabled?: boolean;
		onchange?: (value: number) => void;
	};

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		valueLabel = '',
		showRange = true,
		minLabel = '',
		maxLabel = '',
		disabled = false,
		onchange
	}: Props = $props();

	const displayMinLabel = $derived(minLabel || String(min));
	const displayMaxLabel = $derived(maxLabel || String(max));

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = parseFloat(target.value);
		onchange?.(value);
	}
</script>

<div class="slider-container" class:disabled>
	{#if label || valueLabel}
		<div class="slider-header">
			{#if label}
				<span class="slider-label">{label}</span>
			{/if}
			{#if valueLabel}
				<span class="slider-value">{valueLabel}</span>
			{/if}
		</div>
	{/if}

	<input
		type="range"
		class="slider"
		{min}
		{max}
		{step}
		{disabled}
		bind:value
		oninput={handleInput}
	/>

	{#if showRange}
		<div class="slider-range">
			<span>{displayMinLabel}</span>
			<span>{displayMaxLabel}</span>
		</div>
	{/if}
</div>

<style>
	.slider-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.slider-container.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slider-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.slider-value {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--color-primary);
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: var(--color-surface-secondary);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 3px solid var(--color-surface);
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-fast);
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.slider::-webkit-slider-thumb:active {
		transform: scale(0.95);
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 3px solid var(--color-surface);
		box-shadow: var(--shadow-sm);
	}

	.slider:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.slider-range {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-xs);
		color: var(--color-content-alt);
	}
</style>
