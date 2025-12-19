<script lang="ts">
	import Button from '../ui/Button.svelte';

	interface NavItem {
		label: string;
		href: string;
		active?: boolean;
	}

	interface Props {
		navItems?: NavItem[];
	}

	const defaultNavItems: NavItem[] = [
		{ label: 'Dashboard', href: '/' },
		{ label: 'Borrow', href: '/borrow/eth' },
		{ label: 'Earn', href: '/earn' },
		{ label: 'Stake', href: '/stake' }
	];

	let {
		navItems = defaultNavItems
	}: Props = $props();
</script>

<header class="topbar">
	<div class="container">
		<a href="/" class="logo">
			<span class="logo-text">MagosCryptos</span>
		</a>

		<nav class="nav">
			{#each navItems as item}
				<a href={item.href} class="nav-link" class:active={item.active}>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="actions">
			<Button variant="primary" size="sm">
				Connect Wallet
			</Button>
		</div>
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 50;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		height: var(--header-height);
	}

	.container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-24);
		max-width: var(--content-max-width);
		height: 100%;
		margin: 0 auto;
		padding: 0 var(--space-24);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-8);
		text-decoration: none;
	}

	.logo-text {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--color-primary);
	}

	.nav {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	.nav-link {
		padding: var(--space-8) var(--space-16);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-content-alt);
		text-decoration: none;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.nav-link:hover {
		color: var(--color-content);
		background-color: var(--color-surface-secondary);
	}

	.nav-link.active {
		color: var(--color-primary);
		background-color: rgba(75, 110, 245, 0.1);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-12);
	}

	/* Hide nav on mobile */
	@media (max-width: 768px) {
		.nav {
			display: none;
		}
	}
</style>
