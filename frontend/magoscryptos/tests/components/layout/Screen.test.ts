import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import Screen from '$lib/components/layout/Screen.svelte';

describe('Screen', () => {
	it('renders with title', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Borrow BOLD',
				children: () => document.createTextNode('Content')
			}
		});

		const title = target.querySelector('.title');
		expect(title?.textContent).toBe('Borrow BOLD');

		unmount(component);
	});

	it('renders with subtitle', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Borrow BOLD',
				subtitle: 'Deposit collateral to borrow',
				children: () => document.createTextNode('Content')
			}
		});

		const subtitle = target.querySelector('.subtitle');
		expect(subtitle?.textContent).toBe('Deposit collateral to borrow');

		unmount(component);
	});

	it('does not render subtitle when not provided', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Dashboard',
				children: () => document.createTextNode('Content')
			}
		});

		const subtitle = target.querySelector('.subtitle');
		expect(subtitle).toBeFalsy();

		unmount(component);
	});

	it('renders screen container', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Test Screen',
				children: () => document.createTextNode('Content')
			}
		});

		const screen = target.querySelector('.screen');
		expect(screen).toBeTruthy();

		unmount(component);
	});

	it('renders header section when title is provided', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Test Screen',
				children: () => document.createTextNode('Content')
			}
		});

		const header = target.querySelector('.header');
		expect(header).toBeTruthy();

		unmount(component);
	});

	it('renders content section', () => {
		const target = document.createElement('div');
		const component = mount(Screen, {
			target,
			props: {
				title: 'Test Screen',
				children: () => document.createTextNode('Content')
			}
		});

		const content = target.querySelector('.content');
		expect(content).toBeTruthy();

		unmount(component);
	});
});
