<script lang="ts">
	import type { Delegate, BranchId } from '$lib/types';
	import { Amount } from '$lib/components/display';
	import { Button } from '$lib/components/ui';

	interface Props {
		delegate: Delegate;
		branchId: BranchId;
		onSelect: (delegate: Delegate) => void;
		selectLabel?: string;
		url?: string;
	}

	let { delegate, branchId, onSelect, selectLabel = 'Select', url }: Props = $props();

	// Format rate as percentage
	function formatRate(rate: bigint): string {
		return (Number(rate) / 1e18 * 100).toFixed(2);
	}

	// Format duration in seconds to human readable
	function formatDuration(seconds: bigint): string {
		const secs = Number(seconds);
		if (secs < 60) return `${secs}s`;
		if (secs < 3600) return `${Math.floor(secs / 60)}m`;
		if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
		return `${Math.floor(secs / 86400)}d`;
	}

	// Format BOLD amount in compact notation
	function formatBoldAmount(amount: bigint): string {
		const value = Number(amount) / 1e18;
		if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
		return value.toFixed(0);
	}

	function handleCopyAddress() {
		navigator.clipboard.writeText(delegate.address);
	}
</script>

<div class="delegate-box">
	<div class="delegate-header">
		<div class="delegate-name">
			{#if url}
				<a href={url} target="_blank" rel="noopener noreferrer" class="delegate-link">
					{delegate.name}
					<span class="external-icon">↗</span>
				</a>
			{:else}
				<span>{delegate.name}</span>
			{/if}
		</div>
		<div class="delegate-rate">
			{formatRate(delegate.interestRate)}%
		</div>
	</div>

	<div class="delegate-stats">
		<span class="bold-amount">{formatBoldAmount(delegate.boldAmount)} BOLD</span>
	</div>

	<div class="delegate-details">
		<div class="detail-row">
			<span class="detail-label">Interest rate range</span>
			<span class="detail-value">
				{formatRate(delegate.constraints.minInterestRate)}-{formatRate(delegate.constraints.maxInterestRate)}%
			</span>
		</div>
		<div class="detail-row">
			<span class="detail-label">Max. update frequency</span>
			<span class="detail-value">{formatDuration(delegate.constraints.minInterestRateChangePeriod)}</span>
		</div>
		{#if delegate.fee > 0}
			<div class="detail-row">
				<span class="detail-label">Fees p.a.</span>
				<span class="detail-value">{(delegate.fee * 100).toFixed(2)}%</span>
			</div>
		{/if}
	</div>

	<div class="delegate-actions">
		<button type="button" class="copy-button" onclick={handleCopyAddress}>
			Copy address
		</button>
		<Button
			variant="primary"
			size="sm"
			onclick={() => onSelect(delegate)}
		>
			{selectLabel}
		</Button>
	</div>
</div>

<style>
	.delegate-box {
		display: flex;
		flex-direction: column;
		padding: var(--space-16);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.delegate-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-12);
		border-bottom: 1px solid var(--color-border);
	}

	.delegate-name {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.delegate-link {
		color: var(--color-primary);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.delegate-link:hover {
		text-decoration: underline;
	}

	.external-icon {
		font-size: var(--text-sm);
	}

	.delegate-rate {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.delegate-stats {
		display: flex;
		justify-content: space-between;
		padding: var(--space-12) 0;
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.bold-amount {
		font-weight: var(--weight-medium);
	}

	.delegate-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding: var(--space-12) 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-sm);
	}

	.detail-label {
		color: var(--color-content-alt);
	}

	.detail-value {
		font-weight: var(--weight-medium);
	}

	.delegate-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-16);
	}

	.copy-button {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--text-sm);
		cursor: pointer;
		padding: 0;
	}

	.copy-button:hover {
		text-decoration: underline;
	}
</style>
