import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import StatCard from '$lib/components/display/StatCard.svelte';

describe('StatCard', () => {
	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Total Value',
				children: () => document.createTextNode('$10,000')
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Total Value');

		unmount(component);
	});

	it('renders value content', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Balance',
				children: () => document.createTextNode('1,000')
			}
		});

		const value = target.querySelector('.value');
		expect(value).toBeTruthy();

		unmount(component);
	});

	it('renders secondary value when provided', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Amount',
				secondary: '~$2,500',
				children: () => document.createTextNode('1 ETH')
			}
		});

		const secondary = target.querySelector('.secondary');
		expect(secondary?.textContent).toBe('~$2,500');

		unmount(component);
	});

	it('does not render secondary when not provided', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Amount',
				children: () => document.createTextNode('1 ETH')
			}
		});

		const secondary = target.querySelector('.secondary');
		expect(secondary).toBeFalsy();

		unmount(component);
	});

	it('applies highlight class when highlight prop is true', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Featured',
				highlight: true,
				children: () => document.createTextNode('Value')
			}
		});

		const card = target.querySelector('.stat-card');
		expect(card?.classList.contains('highlight')).toBe(true);

		unmount(component);
	});

	it('does not apply highlight class by default', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Normal',
				children: () => document.createTextNode('Value')
			}
		});

		const card = target.querySelector('.stat-card');
		expect(card?.classList.contains('highlight')).toBe(false);

		unmount(component);
	});

	it('renders container with stat-card class', () => {
		const target = document.createElement('div');
		const component = mount(StatCard, {
			target,
			props: {
				label: 'Test',
				children: () => document.createTextNode('Value')
			}
		});

		const card = target.querySelector('.stat-card');
		expect(card).toBeTruthy();

		unmount(component);
	});
});
