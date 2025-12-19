<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		label?: string;
		disabled?: boolean;
		onchange?: (value: string) => void;
	}

	let {
		options,
		value = $bindable(''),
		placeholder = 'Select...',
		label = '',
		disabled = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let buttonRef: HTMLButtonElement;

	const selectedOption = $derived(options.find(o => o.value === value));

	function toggle() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function select(option: Option) {
		value = option.value;
		isOpen = false;
		onchange?.(option.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isOpen = false;
			buttonRef?.focus();
		}
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.dropdown')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="dropdown" class:disabled>
	{#if label}
		<span class="label">{label}</span>
	{/if}
	<button
		bind:this={buttonRef}
		class="trigger"
		class:open={isOpen}
		{disabled}
		onclick={toggle}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="value" class:placeholder={!selectedOption}>
			{selectedOption?.label ?? placeholder}
		</span>
		<svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="4,6 8,10 12,6" />
		</svg>
	</button>

	{#if isOpen}
		<ul class="menu" role="listbox">
			{#each options as option}
				<li>
					<button
						class="option"
						class:selected={option.value === value}
						onclick={() => select(option)}
						role="option"
						aria-selected={option.value === value}
					>
						{option.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
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

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-8);
		width: 100%;
		padding: var(--space-12) var(--space-16);
		font-size: var(--text-base);
		text-align: left;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.trigger:hover:not(:disabled) {
		border-color: var(--color-border-strong);
	}

	.trigger:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
	}

	.trigger:disabled {
		background-color: var(--color-surface-secondary);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.trigger.open {
		border-color: var(--color-primary);
	}

	.value {
		flex: 1;
		color: var(--color-content);
	}

	.value.placeholder {
		color: var(--color-content-alt2);
	}

	.chevron {
		color: var(--color-content-alt);
		transition: transform var(--transition-fast);
	}

	.trigger.open .chevron {
		transform: rotate(180deg);
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: var(--space-4);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: var(--z-dropdown);
		max-height: 240px;
		overflow-y: auto;
	}

	.option {
		display: block;
		width: 100%;
		padding: var(--space-12) var(--space-16);
		font-size: var(--text-base);
		text-align: left;
		color: var(--color-content);
		transition: background-color var(--transition-fast);
	}

	.option:hover {
		background-color: var(--color-surface-secondary);
	}

	.option.selected {
		background-color: var(--color-primary);
		color: white;
	}

	.option.selected:hover {
		background-color: var(--color-primary-hover);
	}
</style>
