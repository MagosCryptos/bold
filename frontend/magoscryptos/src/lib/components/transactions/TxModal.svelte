<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { txContext } from '$lib/transactions/context.svelte';
	import TxStepList from './TxStepList.svelte';

	// Reactive bindings to transaction context
	const flow = $derived(txContext.flow);
	const isOpen = $derived(txContext.isOpen);
	const isComplete = $derived(txContext.isComplete);
	const hasError = $derived(txContext.hasError);

	function handleClose() {
		if (isComplete || hasError) {
			txContext.dismiss();
		} else {
			txContext.close();
		}
	}

	function handleSuccessAction() {
		if (flow?.successLink) {
			window.location.href = flow.successLink.path;
		}
		txContext.dismiss();
	}

	function handleBackAction() {
		if (flow?.backLink) {
			window.location.href = flow.backLink.path;
		}
		txContext.dismiss();
	}

	function handleRetry() {
		txContext.clearError();
		txContext.retry();
	}
</script>

{#if isOpen && flow}
	<Modal title={flow.title} onclose={handleClose}>
		<div class="tx-modal-content">
			<!-- Progress Steps -->
			<TxStepList steps={flow.steps} currentIndex={flow.currentStepIndex} />

			<!-- Status Messages -->
			{#if isComplete}
				<div class="status-message success">
					<span class="status-icon">✓</span>
					<span class="status-text">{flow.successMessage ?? 'Transaction completed successfully!'}</span>
				</div>
			{:else if hasError}
				<div class="status-message error">
					<span class="status-icon">✕</span>
					<span class="status-text">{flow.error ?? 'Transaction failed'}</span>
				</div>
			{:else}
				<div class="status-message pending">
					<span class="status-text">Please confirm the transaction in your wallet</span>
				</div>
			{/if}

			<!-- Actions -->
			<div class="tx-modal-actions">
				{#if isComplete}
					{#if flow.successLink}
						<Button variant="primary" onclick={handleSuccessAction}>
							{flow.successLink.label}
						</Button>
					{/if}
					<Button variant="secondary" onclick={() => txContext.dismiss()}>
						Close
					</Button>
				{:else if hasError}
					<Button variant="primary" onclick={handleRetry}>
						Retry
					</Button>
					{#if flow.backLink}
						<Button variant="secondary" onclick={handleBackAction}>
							{flow.backLink.label}
						</Button>
					{:else}
						<Button variant="secondary" onclick={() => txContext.dismiss()}>
							Close
						</Button>
					{/if}
				{:else}
					<Button variant="secondary" onclick={handleClose} disabled>
						Cancel
					</Button>
				{/if}
			</div>
		</div>
	</Modal>
{/if}

<style>
	.tx-modal-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-24);
		padding: var(--space-16) 0;
	}

	.status-message {
		display: flex;
		align-items: center;
		gap: var(--space-12);
		padding: var(--space-16);
		border-radius: var(--radius-md);
	}

	.status-message.success {
		background-color: color-mix(in srgb, var(--color-positive) 10%, transparent);
		border: 1px solid var(--color-positive);
	}

	.status-message.error {
		background-color: color-mix(in srgb, var(--color-negative) 10%, transparent);
		border: 1px solid var(--color-negative);
	}

	.status-message.pending {
		background-color: var(--color-surface-secondary);
		border: 1px solid var(--color-border);
	}

	.status-icon {
		font-size: var(--text-lg);
		font-weight: var(--weight-bold);
	}

	.status-message.success .status-icon {
		color: var(--color-positive);
	}

	.status-message.error .status-icon {
		color: var(--color-negative);
	}

	.status-text {
		font-size: var(--text-sm);
	}

	.tx-modal-actions {
		display: flex;
		gap: var(--space-12);
		justify-content: flex-end;
	}
</style>
