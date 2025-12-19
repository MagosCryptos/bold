import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import AmountInput from '$lib/components/forms/AmountInput.svelte';

describe('AmountInput', () => {
	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				label: 'Deposit Amount',
				symbol: 'ETH',
				value: ''
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Deposit Amount');

		unmount(component);
	});

	it('renders token symbol', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: ''
			}
		});

		// Symbol is inside .token container
		const token = target.querySelector('.token');
		expect(token).toBeTruthy();
		expect(token?.textContent).toContain('ETH');

		unmount(component);
	});

	it('displays input value', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: '10.5'
			}
		});

		const input = target.querySelector('input') as HTMLInputElement;
		expect(input?.value).toBe('10.5');

		unmount(component);
	});

	it('renders max button when maxValue is provided', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: '',
				maxValue: '100'
			}
		});

		const maxButton = target.querySelector('.max-button');
		expect(maxButton).toBeTruthy();
		expect(maxButton?.textContent).toBe('Max');

		unmount(component);
	});

	it('does not render max button when maxValue is not provided', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: ''
			}
		});

		const maxButton = target.querySelector('.max-button');
		expect(maxButton).toBeFalsy();

		unmount(component);
	});

	it('renders secondary value when provided', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: '10',
				secondaryValue: '$25,000'
			}
		});

		const secondary = target.querySelector('.secondary');
		expect(secondary?.textContent).toBe('$25,000');

		unmount(component);
	});

	it('applies placeholder', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: '',
				placeholder: '0.00'
			}
		});

		const input = target.querySelector('input') as HTMLInputElement;
		expect(input?.placeholder).toBe('0.00');

		unmount(component);
	});

	it('renders token icon', () => {
		const target = document.createElement('div');
		const component = mount(AmountInput, {
			target,
			props: {
				symbol: 'ETH',
				value: ''
			}
		});

		const tokenIcon = target.querySelector('.token-icon');
		expect(tokenIcon).toBeTruthy();

		unmount(component);
	});
});
