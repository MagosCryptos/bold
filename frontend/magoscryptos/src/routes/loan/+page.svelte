<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirect to colldebt tab by default
	onMount(() => {
		goto('/loan/colldebt', { replaceState: true });
	});
</script>

<p>Redirecting...</p>
