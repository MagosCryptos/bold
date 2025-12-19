import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import CollateralSelector from '$lib/components/forms/CollateralSelector.svelte';

describe('CollateralSelector', () => {
	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH',
				label: 'Select Collateral'
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Select Collateral');

		unmount(component);
	});

	it('renders trigger button with selected value', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH'
			}
		});

		const trigger = target.querySelector('.trigger');
		expect(trigger).toBeTruthy();

		const name = target.querySelector('.name');
		expect(name?.textContent).toBe('Ethereum');

		unmount(component);
	});

	it('renders container with correct class', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH'
			}
		});

		const container = target.querySelector('.collateral-selector');
		expect(container).toBeTruthy();

		unmount(component);
	});

	it('displays selected collateral symbol', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'rETH'
			}
		});

		// The symbol is inside the .info container within the trigger
		const info = target.querySelector('.info');
		expect(info).toBeTruthy();
		expect(info?.textContent).toContain('rETH');

		unmount(component);
	});

	it('displays selected collateral name', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'wstETH'
			}
		});

		const name = target.querySelector('.name');
		expect(name?.textContent).toBe('Lido Staked ETH');

		unmount(component);
	});

	it('renders token icon for selected collateral', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon).toBeTruthy();

		unmount(component);
	});

	it('has aria attributes for accessibility', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH'
			}
		});

		const trigger = target.querySelector('.trigger');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');

		unmount(component);
	});

	it('can be disabled', () => {
		const target = document.createElement('div');
		const component = mount(CollateralSelector, {
			target,
			props: {
				value: 'ETH',
				disabled: true
			}
		});

		const trigger = target.querySelector('.trigger') as HTMLButtonElement;
		expect(trigger?.disabled).toBe(true);

		unmount(component);
	});
});
