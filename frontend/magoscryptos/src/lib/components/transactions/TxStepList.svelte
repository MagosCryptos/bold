<script lang="ts">
	import type { TxStep } from '$lib/transactions/types';
	import { LoadingSpinner } from '$lib/components/ui';

	interface Props {
		steps: TxStep[];
		currentIndex: number;
	}

	let { steps, currentIndex }: Props = $props();

	function getStepIcon(step: TxStep, index: number): string {
		switch (step.status) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'pending':
			case 'confirming':
				return '';
			default:
				return (index + 1).toString();
		}
	}

	function getStepClass(step: TxStep): string {
		switch (step.status) {
			case 'success':
				return 'step-success';
			case 'error':
				return 'step-error';
			case 'pending':
			case 'confirming':
				return 'step-active';
			default:
				return 'step-idle';
		}
	}
</script>

<div class="step-list">
	{#each steps as step, index}
		<div class="step {getStepClass(step)}">
			<div class="step-indicator">
				{#if step.status === 'pending' || step.status === 'confirming'}
					<LoadingSpinner size="sm" />
				{:else}
					<span class="step-number">{getStepIcon(step, index)}</span>
				{/if}
			</div>
			<div class="step-content">
				<span class="step-label">{step.label}</span>
				{#if step.status === 'confirming'}
					<span class="step-subtitle">Waiting for confirmation...</span>
				{:else if step.status === 'error' && step.error}
					<span class="step-error-message">{step.error.message}</span>
				{:else if step.txHash}
					<a
						href="https://etherscan.io/tx/{step.txHash}"
						target="_blank"
						rel="noopener noreferrer"
						class="step-tx-link"
					>
						View transaction ↗
					</a>
				{/if}
			</div>
		</div>
		{#if index < steps.length - 1}
			<div class="step-connector {index < currentIndex ? 'connector-complete' : ''}"></div>
		{/if}
	{/each}
</div>

<style>
	.step-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: var(--space-12);
		padding: var(--space-12) 0;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: var(--color-surface-secondary);
		border: 2px solid var(--color-border);
		flex-shrink: 0;
	}

	.step-number {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-content-alt);
	}

	.step-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
	}

	.step-label {
		font-weight: var(--weight-medium);
	}

	.step-subtitle {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.step-error-message {
		font-size: var(--text-sm);
		color: var(--color-negative);
	}

	.step-tx-link {
		font-size: var(--text-sm);
		color: var(--color-primary);
		text-decoration: none;
	}

	.step-tx-link:hover {
		text-decoration: underline;
	}

	.step-connector {
		width: 2px;
		height: 24px;
		background-color: var(--color-border);
		margin-left: 15px;
	}

	.connector-complete {
		background-color: var(--color-positive);
	}

	/* Step states */
	.step-success .step-indicator {
		background-color: var(--color-positive);
		border-color: var(--color-positive);
	}

	.step-success .step-number {
		color: white;
	}

	.step-error .step-indicator {
		background-color: var(--color-negative);
		border-color: var(--color-negative);
	}

	.step-error .step-number {
		color: white;
	}

	.step-active .step-indicator {
		border-color: var(--color-primary);
	}

	.step-idle {
		opacity: 0.5;
	}
</style>
