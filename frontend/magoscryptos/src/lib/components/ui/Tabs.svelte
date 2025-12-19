<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		active?: string;
		onchange?: (tabId: string) => void;
	}

	let {
		tabs,
		active = $bindable(tabs[0]?.id ?? ''),
		onchange
	}: Props = $props();

	function selectTab(tabId: string) {
		active = tabId;
		onchange?.(tabId);
	}
</script>

<div class="tabs" role="tablist">
	{#each tabs as tab}
		<button
			class="tab"
			class:active={tab.id === active}
			role="tab"
			aria-selected={tab.id === active}
			onclick={() => selectTab(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-4);
		background-color: var(--color-surface-secondary);
		border-radius: var(--radius-md);
	}

	.tab {
		flex: 1;
		padding: var(--space-8) var(--space-16);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
		background-color: transparent;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-content);
	}

	.tab.active {
		background-color: var(--color-surface);
		color: var(--color-content);
		box-shadow: var(--shadow-sm);
	}
</style>
