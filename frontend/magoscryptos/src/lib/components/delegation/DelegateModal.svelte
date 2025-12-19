<script lang="ts">
	import type { Delegate, BranchId, Address } from '$lib/types';
	import { Modal, Input } from '$lib/components/ui';
	import { delegates } from '$lib/stores';
	import { getBranch } from '$lib/web3';
	import { isAddress } from 'viem';
	import DelegateBox from './DelegateBox.svelte';

	interface Props {
		branchId: BranchId;
		visible: boolean;
		onClose: () => void;
		onSelectDelegate: (delegate: Delegate) => void;
	}

	let { branchId, visible, onClose, onSelectDelegate }: Props = $props();

	// Search state
	let searchValue = $state('');
	let customDelegate = $state<Delegate | null>(null);
	let isLoadingCustom = $state(false);
	let loadedDelegates = $state<Delegate[]>([]);
	let isLoadingDelegates = $state(false);

	// Get branch info
	const branch = $derived(getBranch(branchId));

	// Get known delegates for this branch
	const knownDelegatesForBranch = $derived(delegates.getKnownDelegatesForBranch(branchId));

	// Filter known delegates by search term
	const filteredKnownDelegates = $derived(() => {
		if (!searchValue.trim()) return knownDelegatesForBranch;

		const term = searchValue.toLowerCase();
		return knownDelegatesForBranch.filter(({ groupName, strategy }) => {
			const displayName = strategy.name ? `${groupName} - ${strategy.name}` : groupName;
			return displayName.toLowerCase().includes(term) ||
				strategy.address.toLowerCase().includes(term);
		});
	});

	// Check if searching for an address
	const isSearchingAddress = $derived(
		searchValue.trim().startsWith('0x') && searchValue.trim().length >= 10
	);

	// Load delegates data when modal opens or known delegates change
	$effect(() => {
		if (visible && knownDelegatesForBranch.length > 0) {
			loadDelegatesData();
		}
	});

	// Load custom delegate when searching for address
	$effect(() => {
		if (isSearchingAddress && isAddress(searchValue.trim())) {
			loadCustomDelegate(searchValue.trim() as Address);
		} else {
			customDelegate = null;
		}
	});

	async function loadDelegatesData() {
		const addresses = knownDelegatesForBranch.map(d => d.strategy.address as Address);
		if (addresses.length === 0) return;

		isLoadingDelegates = true;
		try {
			loadedDelegates = await delegates.fetchDelegates(branchId, addresses);
		} catch (error) {
			console.error('Failed to load delegates:', error);
		} finally {
			isLoadingDelegates = false;
		}
	}

	async function loadCustomDelegate(address: Address) {
		// Check if it's already a known delegate
		const isKnown = knownDelegatesForBranch.some(
			d => d.strategy.address.toLowerCase() === address.toLowerCase()
		);
		if (isKnown) {
			customDelegate = null;
			return;
		}

		isLoadingCustom = true;
		try {
			customDelegate = await delegates.fetchDelegate(branchId, address);
		} catch (error) {
			console.error('Failed to load custom delegate:', error);
			customDelegate = null;
		} finally {
			isLoadingCustom = false;
		}
	}

	function handleSelect(delegate: Delegate) {
		onSelectDelegate(delegate);
		onClose();
	}

	function getDelegateForStrategy(strategyAddress: string): Delegate | undefined {
		return loadedDelegates.find(
			d => d.address.toLowerCase() === strategyAddress.toLowerCase()
		);
	}
</script>

<Modal title="Select Interest Rate Delegate" {visible} {onClose}>
	<div class="delegate-modal-content">
		<p class="intro">
			Delegates manage your interest rate on your behalf. Choose a delegate that matches your risk tolerance.
		</p>

		<div class="search-container">
			<Input
				bind:value={searchValue}
				placeholder="Search by name or address..."
				type="text"
			/>
		</div>

		<h3 class="section-title">Available Delegates</h3>

		<div class="delegates-list">
			{#if customDelegate && isSearchingAddress}
				<div class="custom-delegate-section">
					<span class="section-label">Custom Delegate</span>
					<DelegateBox
						delegate={customDelegate}
						{branchId}
						onSelect={handleSelect}
						selectLabel="Choose"
					/>
				</div>
			{/if}

			{#if isLoadingCustom && isSearchingAddress}
				<div class="loading-state">Loading custom delegate...</div>
			{/if}

			{#if delegates.knownDelegatesLoading}
				<div class="loading-state">Loading delegates...</div>
			{:else if delegates.knownDelegatesError}
				<div class="error-state">Error loading delegates</div>
			{:else if filteredKnownDelegates().length === 0 && searchValue.trim() && !customDelegate}
				<div class="empty-state">
					No delegates found matching "{searchValue}"
				</div>
			{:else}
				{#each filteredKnownDelegates() as { groupName, groupUrl, strategy }}
					{@const delegate = getDelegateForStrategy(strategy.address)}
					{@const displayName = strategy.name ? `${groupName} - ${strategy.name}` : groupName}

					{#if isLoadingDelegates}
						<div class="loading-state">Loading...</div>
					{:else if delegate}
						<DelegateBox
							delegate={{ ...delegate, name: displayName }}
							{branchId}
							onSelect={handleSelect}
							selectLabel="Choose"
							url={groupUrl}
						/>
					{:else}
						<div class="unavailable-state">
							{displayName} - Data unavailable
						</div>
					{/if}
				{/each}
			{/if}
		</div>

		<div class="footer">
			<a
				href="https://docs.liquity.org/v2-faq/redemptions-and-delegation#what-is-delegation-of-interest-rates"
				target="_blank"
				rel="noopener noreferrer"
				class="learn-more"
			>
				What is delegation?
			</a>
		</div>
	</div>
</Modal>

<style>
	.delegate-modal-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
	}

	.intro {
		font-size: var(--text-base);
		color: var(--color-content-alt);
	}

	.search-container {
		width: 100%;
	}

	.section-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.delegates-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		max-height: 400px;
		overflow-y: auto;
	}

	.custom-delegate-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.section-label {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
		font-style: italic;
	}

	.loading-state,
	.error-state,
	.empty-state,
	.unavailable-state {
		padding: var(--space-24);
		text-align: center;
		color: var(--color-content-alt);
	}

	.error-state {
		color: var(--color-error);
	}

	.footer {
		display: flex;
		justify-content: center;
		padding-top: var(--space-16);
	}

	.learn-more {
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--text-sm);
	}

	.learn-more:hover {
		text-decoration: underline;
	}
</style>
