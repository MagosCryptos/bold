<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AppShell } from '$lib/components/layout';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MagosCryptos - Liquity V2</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
