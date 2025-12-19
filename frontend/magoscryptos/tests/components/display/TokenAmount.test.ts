import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import TokenAmount from '$lib/components/display/TokenAmount.svelte';

describe('TokenAmount', () => {
	it('renders value and symbol', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 10.5,
				symbol: 'ETH'
			}
		});

		expect(target.textContent).toContain('10.5');
		expect(target.textContent).toContain('ETH');

		unmount(component);
	});

	it('renders token icon by default', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 100,
				symbol: 'BOLD'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon).toBeTruthy();

		unmount(component);
	});

	it('hides token icon when showIcon is false', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 100,
				symbol: 'BOLD',
				showIcon: false
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon).toBeFalsy();

		unmount(component);
	});

	it('applies decimals formatting', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 1.23456789,
				symbol: 'ETH',
				decimals: 4
			}
		});

		expect(target.textContent).toContain('1.2346');

		unmount(component);
	});

	it('renders container with correct class', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 50,
				symbol: 'LQTY'
			}
		});

		const container = target.querySelector('.token-amount');
		expect(container).toBeTruthy();

		unmount(component);
	});

	it('displays symbol text', () => {
		const target = document.createElement('div');
		const component = mount(TokenAmount, {
			target,
			props: {
				value: 25000,
				symbol: 'LQTY'
			}
		});

		// Check that the symbol appears in the main section
		const main = target.querySelector('.main');
		expect(main).toBeTruthy();
		expect(main?.textContent).toContain('LQTY');

		unmount(component);
	});
});
