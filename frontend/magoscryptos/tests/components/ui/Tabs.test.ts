import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Tabs from '$lib/components/ui/Tabs.svelte';

describe('Tabs', () => {
	const tabs = [
		{ id: 'tab1', label: 'First Tab' },
		{ id: 'tab2', label: 'Second Tab' },
		{ id: 'tab3', label: 'Third Tab' }
	];

	it('renders all tabs', () => {
		const target = document.createElement('div');
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab1'
			}
		});

		const tabButtons = target.querySelectorAll('.tab');
		expect(tabButtons.length).toBe(3);

		unmount(component);
	});

	it('displays tab labels correctly', () => {
		const target = document.createElement('div');
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab1'
			}
		});

		const tabButtons = target.querySelectorAll('.tab');
		expect(tabButtons[0].textContent).toBe('First Tab');
		expect(tabButtons[1].textContent).toBe('Second Tab');
		expect(tabButtons[2].textContent).toBe('Third Tab');

		unmount(component);
	});

	it('marks active tab correctly', () => {
		const target = document.createElement('div');
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab2'
			}
		});

		const tabButtons = target.querySelectorAll('.tab');
		expect(tabButtons[0].classList.contains('active')).toBe(false);
		expect(tabButtons[1].classList.contains('active')).toBe(true);
		expect(tabButtons[2].classList.contains('active')).toBe(false);

		unmount(component);
	});

	it('calls onchange when tab is clicked', () => {
		const target = document.createElement('div');
		const handleChange = vi.fn();
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab1',
				onchange: handleChange
			}
		});

		const tabButtons = target.querySelectorAll('.tab');
		(tabButtons[1] as HTMLButtonElement).click();

		expect(handleChange).toHaveBeenCalledTimes(1);
		expect(handleChange).toHaveBeenCalledWith('tab2');

		unmount(component);
	});

	it('renders tabs container', () => {
		const target = document.createElement('div');
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab1'
			}
		});

		const container = target.querySelector('.tabs');
		expect(container).toBeTruthy();

		unmount(component);
	});

	it('has proper role attributes', () => {
		const target = document.createElement('div');
		const component = mount(Tabs, {
			target,
			props: {
				tabs,
				active: 'tab1'
			}
		});

		const container = target.querySelector('.tabs');
		expect(container?.getAttribute('role')).toBe('tablist');

		const tabButtons = target.querySelectorAll('.tab');
		expect(tabButtons[0].getAttribute('role')).toBe('tab');

		unmount(component);
	});
});
