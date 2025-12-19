/**
 * Integration tests for wallet connection
 *
 * These tests verify that:
 * 1. The wallet store correctly responds to watchAccount callbacks
 * 2. State updates propagate correctly when wallets connect/disconnect
 * 3. The same wagmiConfig is used by both the store and AppKit
 *
 * This catches the bug where we had two separate wagmiConfig instances,
 * causing the store to not update when AppKit connected a wallet.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to define mock state before mocks are hoisted
const { mockAccountState, accountCallbacks, resetMockState } = vi.hoisted(() => {
	const state = {
		current: {
			address: undefined as `0x${string}` | undefined,
			chainId: undefined as number | undefined,
			isConnected: false,
			isConnecting: false,
			isReconnecting: false
		}
	};

	const callbacks: Array<(account: typeof state.current) => void> = [];

	return {
		mockAccountState: state,
		accountCallbacks: callbacks,
		resetMockState: () => {
			state.current = {
				address: undefined,
				chainId: undefined,
				isConnected: false,
				isConnecting: false,
				isReconnecting: false
			};
			callbacks.length = 0;
		}
	};
});

// Mock the web3 module
vi.mock('$lib/web3', () => ({
	wagmiConfig: { _testId: 'shared-config' }, // Identifiable config object
	openWalletModal: vi.fn(),
	closeWalletModal: vi.fn(),
	getAppKit: vi.fn(() => null),
	chain: { id: 1, name: 'Ethereum' },
	CHAIN_CONFIG: { id: 1, name: 'Ethereum' },
	getBranchContract: vi.fn(),
	getProtocolContract: vi.fn(),
	BRANCHES: [],
	getBranch: vi.fn(),
	PROTOCOL_CONTRACTS: {}
}));

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
	getAccount: vi.fn(() => mockAccountState.current),
	watchAccount: vi.fn((_config, options) => {
		// Store the callback so we can trigger it in tests
		accountCallbacks.push(options.onChange);
		// Return unwatch function
		return () => {
			const index = accountCallbacks.indexOf(options.onChange);
			if (index > -1) accountCallbacks.splice(index, 1);
		};
	}),
	disconnect: vi.fn(() => Promise.resolve()),
	getBalance: vi.fn(() => Promise.resolve({ value: 1000000000000000000n })) // 1 ETH
}));

// Helper to simulate wallet connection (what AppKit does internally)
function simulateWalletConnect(address: `0x${string}`) {
	mockAccountState.current = {
		address,
		chainId: 1,
		isConnected: true,
		isConnecting: false,
		isReconnecting: false
	};
	// Trigger all registered callbacks (simulates AppKit triggering watchAccount)
	accountCallbacks.forEach((cb) => cb(mockAccountState.current));
}

// Helper to simulate wallet disconnect
function simulateWalletDisconnect() {
	mockAccountState.current = {
		address: undefined,
		chainId: undefined,
		isConnected: false,
		isConnecting: false,
		isReconnecting: false
	};
	accountCallbacks.forEach((cb) => cb(mockAccountState.current));
}

// Helper to simulate connecting state
function simulateConnecting() {
	mockAccountState.current = {
		...mockAccountState.current,
		isConnecting: true
	};
	accountCallbacks.forEach((cb) => cb(mockAccountState.current));
}

describe('Wallet Connection Integration', () => {
	beforeEach(() => {
		resetMockState();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Wallet Store State Management', () => {
		it('initializes with disconnected state', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			expect(wallet.isConnected).toBe(false);
			expect(wallet.address).toBeUndefined();
			expect(wallet.shortAddress).toBeUndefined();
		});

		it('updates state when wallet connects via watchAccount callback', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// Verify initial state
			expect(wallet.isConnected).toBe(false);

			// Simulate wallet connection (triggers watchAccount callback)
			// This is what AppKit does when a wallet connects
			simulateWalletConnect('0x1234567890abcdef1234567890abcdef12345678');

			// Wait for state to update
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.isConnected).toBe(true);
			expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
			expect(wallet.shortAddress).toBe('0x1234...5678');
		});

		it('updates state when wallet disconnects', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// First connect
			simulateWalletConnect('0x1234567890abcdef1234567890abcdef12345678');
			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(wallet.isConnected).toBe(true);

			// Then disconnect
			simulateWalletDisconnect();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.isConnected).toBe(false);
			expect(wallet.address).toBeUndefined();
			expect(wallet.shortAddress).toBeUndefined();
		});

		it('tracks connecting state', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			simulateConnecting();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.isConnecting).toBe(true);
		});

		it('fetches ETH balance after connection', async () => {
			vi.resetModules();
			const { getBalance } = await import('@wagmi/core');
			const { wallet } = await import('$lib/stores/wallet.svelte');

			simulateWalletConnect('0x1234567890abcdef1234567890abcdef12345678');
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(getBalance).toHaveBeenCalled();
			expect(wallet.ethBalance).toBe(1000000000000000000n);
			expect(wallet.formattedEthBalance).toBe('1.0000');
		});

		it('clears balance on disconnect', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// Connect first
			simulateWalletConnect('0x1234567890abcdef1234567890abcdef12345678');
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(wallet.ethBalance).toBe(1000000000000000000n);

			// Disconnect via store method
			await wallet.disconnectWallet();

			expect(wallet.ethBalance).toBeUndefined();
		});
	});

	describe('watchAccount Integration (Critical - catches the dual-config bug)', () => {
		it('registers watchAccount callback on store initialization', async () => {
			vi.resetModules();
			const { watchAccount } = await import('@wagmi/core');

			await import('$lib/stores/wallet.svelte');

			expect(watchAccount).toHaveBeenCalled();
			expect(accountCallbacks.length).toBeGreaterThan(0);
		});

		it('uses the same wagmiConfig for watchAccount that AppKit uses', async () => {
			vi.resetModules();
			const { watchAccount } = await import('@wagmi/core');
			const { wagmiConfig } = await import('$lib/web3');

			await import('$lib/stores/wallet.svelte');

			// This is the critical test - verifies we use the shared config
			// The bug was: we had our own config, but AppKit used a different one
			expect(watchAccount).toHaveBeenCalledWith(wagmiConfig, expect.any(Object));

			// Verify it's the specific config we expect (has our test marker)
			const callArgs = vi.mocked(watchAccount).mock.calls[0];
			expect(callArgs[0]).toBe(wagmiConfig);
		});

		it('responds to account changes from external sources (simulating AppKit)', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// This simulates what happens when AppKit connects a wallet:
			// AppKit updates the wagmiConfig state, which triggers watchAccount callbacks
			expect(wallet.isConnected).toBe(false);

			// Simulate AppKit connecting (triggers our callback)
			simulateWalletConnect('0xabcdef1234567890abcdef1234567890abcdef12');
			await new Promise((resolve) => setTimeout(resolve, 10));

			// Our store should have updated - this would fail with the dual-config bug
			expect(wallet.isConnected).toBe(true);
			expect(wallet.address).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
			expect(wallet.shortAddress).toBe('0xabcd...ef12');
		});
	});

	describe('Edge Cases', () => {
		it('handles rapid connect/disconnect cycles', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// Rapid state changes
			simulateWalletConnect('0x1111111111111111111111111111111111111111');
			simulateWalletDisconnect();
			simulateWalletConnect('0x2222222222222222222222222222222222222222');

			await new Promise((resolve) => setTimeout(resolve, 50));

			// Should end up connected with the last address
			expect(wallet.isConnected).toBe(true);
			expect(wallet.address).toBe('0x2222222222222222222222222222222222222222');
		});

		it('handles address change without disconnect (account switch)', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// Connect with first address
			simulateWalletConnect('0x1111111111111111111111111111111111111111');
			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(wallet.address).toBe('0x1111111111111111111111111111111111111111');

			// Change to second address (account switch in wallet)
			simulateWalletConnect('0x2222222222222222222222222222222222222222');
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.isConnected).toBe(true);
			expect(wallet.address).toBe('0x2222222222222222222222222222222222222222');
			expect(wallet.shortAddress).toBe('0x2222...2222');
		});

		it('handles chain ID changes', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			// Connect on chain 1
			mockAccountState.current = {
				address: '0x1234567890abcdef1234567890abcdef12345678',
				chainId: 1,
				isConnected: true,
				isConnecting: false,
				isReconnecting: false
			};
			accountCallbacks.forEach((cb) => cb(mockAccountState.current));
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.chainId).toBe(1);

			// Switch to chain 137 (Polygon)
			mockAccountState.current.chainId = 137;
			accountCallbacks.forEach((cb) => cb(mockAccountState.current));
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.chainId).toBe(137);
		});

		it('handles reconnecting state', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			mockAccountState.current = {
				address: '0x1234567890abcdef1234567890abcdef12345678',
				chainId: 1,
				isConnected: false,
				isConnecting: false,
				isReconnecting: true
			};
			accountCallbacks.forEach((cb) => cb(mockAccountState.current));
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wallet.isReconnecting).toBe(true);
		});
	});

	describe('Derived State', () => {
		it('correctly formats short address', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			simulateWalletConnect('0xabcdef1234567890abcdef1234567890abcdef12');
			await new Promise((resolve) => setTimeout(resolve, 10));

			// First 6 chars + ... + last 4 chars
			expect(wallet.shortAddress).toBe('0xabcd...ef12');
		});

		it('correctly formats ETH balance', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			simulateWalletConnect('0x1234567890abcdef1234567890abcdef12345678');
			await new Promise((resolve) => setTimeout(resolve, 50));

			// 1 ETH = 1000000000000000000 wei
			expect(wallet.formattedEthBalance).toBe('1.0000');
		});

		it('returns undefined for formatted balance when not connected', async () => {
			vi.resetModules();
			const { wallet } = await import('$lib/stores/wallet.svelte');

			expect(wallet.formattedEthBalance).toBeUndefined();
		});
	});
});
