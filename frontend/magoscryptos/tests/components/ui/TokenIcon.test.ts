import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import TokenIcon from '$lib/components/ui/TokenIcon.svelte';

describe('TokenIcon', () => {
	it('renders with symbol', () => {
		const target = document.createElement('div');
		const component = mount(TokenIcon, {
			target,
			props: {
				symbol: 'ETH'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon).toBeTruthy();
		// TokenIcon shows first letter
		expect(icon?.textContent?.trim()).toBe('E');

		unmount(component);
	});

	it('applies default size (md)', () => {
		const target = document.createElement('div');
		const component = mount(TokenIcon, {
			target,
			props: {
				symbol: 'ETH'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon?.classList.contains('md')).toBe(true);

		unmount(component);
	});

	it('applies small size', () => {
		const target = document.createElement('div');
		const component = mount(TokenIcon, {
			target,
			props: {
				symbol: 'ETH',
				size: 'sm'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon?.classList.contains('sm')).toBe(true);

		unmount(component);
	});

	it('applies large size', () => {
		const target = document.createElement('div');
		const component = mount(TokenIcon, {
			target,
			props: {
				symbol: 'ETH',
				size: 'lg'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon?.classList.contains('lg')).toBe(true);

		unmount(component);
	});

	it('renders first letter of symbol', () => {
		const symbols = ['ETH', 'rETH', 'wstETH', 'BOLD', 'LQTY'];
		const target = document.createElement('div');

		for (const symbol of symbols) {
			target.innerHTML = '';
			const component = mount(TokenIcon, {
				target,
				props: { symbol }
			});

			const icon = target.querySelector('.token-icon');
			expect(icon?.textContent?.trim()).toBe(symbol.charAt(0));

			unmount(component);
		}
	});

	it('has title attribute with symbol', () => {
		const target = document.createElement('div');
		const component = mount(TokenIcon, {
			target,
			props: {
				symbol: 'BOLD'
			}
		});

		const icon = target.querySelector('.token-icon');
		expect(icon?.getAttribute('title')).toBe('BOLD');

		unmount(component);
	});
});
