<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'full';
		children: Snippet;
		actions?: Snippet;
	}

	let {
		title = '',
		subtitle = '',
		maxWidth = 'md',
		children,
		actions
	}: Props = $props();

	const maxWidthMap = {
		sm: '480px',
		md: '640px',
		lg: '960px',
		full: '100%'
	};
</script>

<main class="screen" style="--max-width: {maxWidthMap[maxWidth]}">
	{#if title || actions}
		<div class="header">
			<div class="titles">
				{#if title}
					<h1 class="title">{title}</h1>
				{/if}
				{#if subtitle}
					<p class="subtitle">{subtitle}</p>
				{/if}
			</div>
			{#if actions}
				<div class="actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}
	<div class="content">
		{@render children()}
	</div>
</main>

<style>
	.screen {
		width: 100%;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: var(--space-32) var(--space-24);
		padding-bottom: calc(var(--space-32) + 80px); /* Account for mobile bottom bar */
	}

	@media (min-width: 769px) {
		.screen {
			padding-bottom: var(--space-32);
		}
	}

	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-16);
		margin-bottom: var(--space-32);
	}

	.titles {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.title {
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		margin: 0;
	}

	.subtitle {
		font-size: var(--text-base);
		color: var(--color-content-alt);
		margin: 0;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}
</style>
