<script lang="ts">
	interface NavItem {
		label: string;
		href: string;
		icon: 'dashboard' | 'borrow' | 'earn' | 'stake' | 'account';
		active?: boolean;
	}

	interface Props {
		navItems?: NavItem[];
	}

	const defaultNavItems: NavItem[] = [
		{ label: 'Home', href: '/', icon: 'dashboard' },
		{ label: 'Borrow', href: '/borrow/eth', icon: 'borrow' },
		{ label: 'Earn', href: '/earn', icon: 'earn' },
		{ label: 'Stake', href: '/stake', icon: 'stake' },
		{ label: 'Account', href: '/account', icon: 'account' }
	];

	let {
		navItems = defaultNavItems
	}: Props = $props();
</script>

<nav class="bottombar">
	{#each navItems as item}
		<a href={item.href} class="nav-item" class:active={item.active}>
			<span class="icon">
				{#if item.icon === 'dashboard'}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="7" rx="1" />
						<rect x="14" y="3" width="7" height="7" rx="1" />
						<rect x="3" y="14" width="7" height="7" rx="1" />
						<rect x="14" y="14" width="7" height="7" rx="1" />
					</svg>
				{:else if item.icon === 'borrow'}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="9" />
						<line x1="12" y1="8" x2="12" y2="16" />
						<line x1="8" y1="12" x2="16" y2="12" />
					</svg>
				{:else if item.icon === 'earn'}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
						<polyline points="16,7 22,7 22,13" />
					</svg>
				{:else if item.icon === 'stake'}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="11" width="18" height="10" rx="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
				{:else if item.icon === 'account'}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="8" r="4" />
						<path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
					</svg>
				{/if}
			</span>
			<span class="label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.bottombar {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background-color: var(--color-surface);
		border-top: 1px solid var(--color-border);
		padding: var(--space-8) var(--space-16);
		padding-bottom: calc(var(--space-8) + env(safe-area-inset-bottom, 0));
	}

	@media (max-width: 768px) {
		.bottombar {
			display: flex;
			justify-content: space-around;
		}
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-8);
		text-decoration: none;
		color: var(--color-content-alt);
		transition: color var(--transition-fast);
	}

	.nav-item:hover,
	.nav-item.active {
		color: var(--color-primary);
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.label {
		font-size: 10px;
		font-weight: var(--weight-medium);
	}
</style>
