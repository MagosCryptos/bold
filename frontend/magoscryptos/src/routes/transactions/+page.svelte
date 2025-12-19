<script lang="ts">
	import { Screen } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';

	// Mock transaction flow data
	const flow = {
		title: 'Open Borrow Position',
		status: 'in-progress' as const,
		currentStep: 1,
		steps: [
			{ id: 'approve', name: 'Approve ETH', status: 'completed' as const, hash: '0x1234...5678' },
			{ id: 'deposit', name: 'Open Position', status: 'pending' as const, hash: null },
			{ id: 'verify', name: 'Verify on Chain', status: 'pending' as const, hash: null }
		]
	};

	const stepStatusIcon = (status: string) => {
		switch (status) {
			case 'completed': return '✓';
			case 'pending': return '○';
			case 'error': return '✗';
			default: return '○';
		}
	};
</script>

<Screen title="Transaction" subtitle={flow.title}>
	<div class="tx-container">
		<div class="steps-list">
			{#each flow.steps as step, i}
				<div class="step" class:active={i === flow.currentStep} class:completed={step.status === 'completed'}>
					<div class="step-indicator">
						<span class="step-icon">{stepStatusIcon(step.status)}</span>
					</div>
					<div class="step-content">
						<span class="step-name">{step.name}</span>
						{#if step.hash}
							<!-- svelte-ignore a11y_invalid_attribute -->
							<a href="#" class="step-hash">{step.hash}</a>
						{:else if i === flow.currentStep}
							<span class="step-status">Awaiting confirmation...</span>
						{/if}
					</div>
				</div>
				{#if i < flow.steps.length - 1}
					<div class="step-connector" class:completed={step.status === 'completed'}></div>
				{/if}
			{/each}
		</div>

		<div class="actions">
			<Button variant="tertiary" onclick={() => window.history.back()}>
				Back to editing
			</Button>
		</div>
	</div>
</Screen>

<style>
	.tx-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-32);
		max-width: 480px;
	}

	.steps-list {
		display: flex;
		flex-direction: column;
		padding: var(--space-24);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.step {
		display: flex;
		gap: var(--space-16);
		padding: var(--space-16) 0;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background-color: var(--color-surface-secondary);
		border: 2px solid var(--color-border);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.step.completed .step-indicator {
		background-color: var(--color-positive);
		border-color: var(--color-positive);
		color: white;
	}

	.step.active .step-indicator {
		border-color: var(--color-primary);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(75, 110, 245, 0.4); }
		50% { box-shadow: 0 0 0 8px rgba(75, 110, 245, 0); }
	}

	.step-icon {
		font-size: var(--text-sm);
		font-weight: var(--weight-bold);
	}

	.step-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.step-name {
		font-weight: var(--weight-medium);
	}

	.step-hash {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-primary);
	}

	.step-status {
		font-size: var(--text-sm);
		color: var(--color-content-alt);
	}

	.step-connector {
		width: 2px;
		height: 24px;
		background-color: var(--color-border);
		margin-left: 15px;
	}

	.step-connector.completed {
		background-color: var(--color-positive);
	}

	.actions {
		display: flex;
		justify-content: center;
	}
</style>
