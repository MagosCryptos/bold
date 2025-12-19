import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import AppShell from '$lib/components/layout/AppShell.svelte';

describe('AppShell', () => {
	it('renders app-shell container', () => {
		const target = document.createElement('div');
		const component = mount(AppShell, {
			target,
			props: {
				children: () => document.createTextNode('Main content')
			}
		});

		const shell = target.querySelector('.app-shell');
		expect(shell).toBeTruthy();

		unmount(component);
	});

	it('renders TopBar component', () => {
		const target = document.createElement('div');
		const component = mount(AppShell, {
			target,
			props: {
				children: () => document.createTextNode('Main content')
			}
		});

		const topbar = target.querySelector('.topbar');
		expect(topbar).toBeTruthy();

		unmount(component);
	});

	it('renders BottomBar component', () => {
		const target = document.createElement('div');
		const component = mount(AppShell, {
			target,
			props: {
				children: () => document.createTextNode('Main content')
			}
		});

		const bottombar = target.querySelector('.bottombar');
		expect(bottombar).toBeTruthy();

		unmount(component);
	});

	it('renders main content area', () => {
		const target = document.createElement('div');
		const component = mount(AppShell, {
			target,
			props: {
				children: () => document.createTextNode('Main content')
			}
		});

		const main = target.querySelector('.main');
		expect(main).toBeTruthy();

		unmount(component);
	});

	it('has correct layout structure', () => {
		const target = document.createElement('div');
		const component = mount(AppShell, {
			target,
			props: {
				children: () => document.createTextNode('Main content')
			}
		});

		const shell = target.querySelector('.app-shell');
		expect(shell?.children.length).toBeGreaterThanOrEqual(2);

		unmount(component);
	});
});
