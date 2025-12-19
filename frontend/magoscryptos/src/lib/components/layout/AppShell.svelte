<script lang="ts">
	import type { Snippet } from 'svelte';
	import TopBar from './TopBar.svelte';
	import BottomBar from './BottomBar.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app-shell">
	<TopBar />
	<div class="main">
		{@render children()}
	</div>
	<BottomBar />
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main {
		flex: 1;
		background-color: var(--color-surface-secondary);
	}
</style>
