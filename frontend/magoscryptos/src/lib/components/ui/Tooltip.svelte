<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		children: Snippet;
	}

	let {
		text,
		position = 'top',
		children
	}: Props = $props();

	let visible = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="tooltip-wrapper"
	role="presentation"
	onmouseenter={() => visible = true}
	onmouseleave={() => visible = false}
	onfocus={() => visible = true}
	onblur={() => visible = false}
>
	{@render children()}
	{#if visible && text}
		<div class="tooltip {position}" role="tooltip">
			{text}
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-block;
	}

	.tooltip {
		position: absolute;
		padding: var(--space-8) var(--space-12);
		font-size: var(--text-sm);
		color: white;
		background-color: var(--color-content);
		border-radius: var(--radius-sm);
		white-space: nowrap;
		z-index: var(--z-tooltip);
		pointer-events: none;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		border: 6px solid transparent;
	}

	.top {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: var(--space-8);
	}

	.top::after {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-top-color: var(--color-content);
	}

	.bottom {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: var(--space-8);
	}

	.bottom::after {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-bottom-color: var(--color-content);
	}

	.left {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: var(--space-8);
	}

	.left::after {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-left-color: var(--color-content);
	}

	.right {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: var(--space-8);
	}

	.right::after {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-right-color: var(--color-content);
	}
</style>
