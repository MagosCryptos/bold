import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import Amount from '$lib/components/display/Amount.svelte';

describe('Amount', () => {
	it('renders numeric value', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 1234.56
			}
		});

		// toLocaleString adds thousands separators
		expect(target.textContent).toContain('1,234.56');

		unmount(component);
	});

	it('applies decimals formatting', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 1234.5678,
				decimals: 2
			}
		});

		expect(target.textContent).toContain('1,234.57');

		unmount(component);
	});

	it('renders prefix', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 100,
				prefix: '$'
			}
		});

		expect(target.textContent).toContain('$');
		expect(target.textContent).toContain('100');

		unmount(component);
	});

	it('renders suffix', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 5.5,
				suffix: '%'
			}
		});

		expect(target.textContent).toContain('5.50');
		expect(target.textContent).toContain('%');

		unmount(component);
	});

	it('renders both prefix and suffix', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 100,
				prefix: '~',
				suffix: ' ETH'
			}
		});

		expect(target.textContent).toContain('~');
		expect(target.textContent).toContain('100');
		expect(target.textContent).toContain('ETH');

		unmount(component);
	});

	it('handles zero value', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 0
			}
		});

		expect(target.textContent).toContain('0.00');

		unmount(component);
	});

	it('handles large numbers', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: 1000000
			}
		});

		// toLocaleString adds thousands separators
		expect(target.textContent).toContain('1,000,000.00');

		unmount(component);
	});

	it('handles negative numbers', () => {
		const target = document.createElement('div');
		const component = mount(Amount, {
			target,
			props: {
				value: -50.5,
				decimals: 1
			}
		});

		expect(target.textContent).toContain('-50.5');

		unmount(component);
	});
});
