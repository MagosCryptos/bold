<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AppShell } from '$lib/components/layout';
	import { onMount } from 'svelte';

	// Initialize Web3 - this imports and runs AppKit setup
	import { getAppKit } from '$lib/web3/appkit';
	import { prices, pools } from '$lib/stores';

	let { children } = $props();

	// Initialize Web3 on mount (browser only)
	onMount(() => {
		// Initialize AppKit for wallet connection
		getAppKit();

		// Start fetching prices and pool stats
		const stopPrices = prices.startAutoRefresh(30000); // 30 seconds
		const stopPools = pools.startAutoRefresh(60000); // 60 seconds

		return () => {
			stopPrices();
			stopPools();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MagosCryptos - Liquity V2</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
