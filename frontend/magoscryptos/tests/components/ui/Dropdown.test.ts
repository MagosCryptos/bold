import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Dropdown from '$lib/components/ui/Dropdown.svelte';

describe('Dropdown', () => {
	const options = [
		{ value: 'eth', label: 'Ethereum' },
		{ value: 'btc', label: 'Bitcoin' },
		{ value: 'sol', label: 'Solana' }
	];

	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				label: 'Select Token',
				options,
				value: 'eth'
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Select Token');

		unmount(component);
	});

	it('renders trigger button', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: 'eth'
			}
		});

		const trigger = target.querySelector('.trigger');
		expect(trigger).toBeTruthy();

		unmount(component);
	});

	it('shows selected value in trigger', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: 'btc'
			}
		});

		const value = target.querySelector('.value');
		expect(value?.textContent).toBe('Bitcoin');

		unmount(component);
	});

	it('renders dropdown container', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: 'eth'
			}
		});

		const container = target.querySelector('.dropdown');
		expect(container).toBeTruthy();

		unmount(component);
	});

	it('can be disabled', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: 'eth',
				disabled: true
			}
		});

		const trigger = target.querySelector('.trigger') as HTMLButtonElement;
		expect(trigger?.disabled).toBe(true);

		unmount(component);
	});

	it('shows placeholder when no value selected', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: '',
				placeholder: 'Choose an option...'
			}
		});

		const value = target.querySelector('.value');
		expect(value?.textContent).toBe('Choose an option...');
		expect(value?.classList.contains('placeholder')).toBe(true);

		unmount(component);
	});

	it('has aria attributes for accessibility', () => {
		const target = document.createElement('div');
		const component = mount(Dropdown, {
			target,
			props: {
				options,
				value: 'eth'
			}
		});

		const trigger = target.querySelector('.trigger');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');

		unmount(component);
	});
});
