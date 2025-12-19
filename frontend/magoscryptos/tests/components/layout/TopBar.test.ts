import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import TopBar from '$lib/components/layout/TopBar.svelte';

describe('TopBar', () => {
	it('renders topbar container', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const topbar = target.querySelector('.topbar');
		expect(topbar).toBeTruthy();

		unmount(component);
	});

	it('renders logo', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const logo = target.querySelector('.logo');
		expect(logo).toBeTruthy();

		unmount(component);
	});

	it('renders navigation links', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const nav = target.querySelector('.nav');
		expect(nav).toBeTruthy();

		const links = target.querySelectorAll('.nav-link');
		expect(links.length).toBeGreaterThan(0);

		unmount(component);
	});

	it('contains Dashboard link', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const links = target.querySelectorAll('.nav-link');
		const texts = Array.from(links).map((l) => l.textContent?.trim());
		expect(texts).toContain('Dashboard');

		unmount(component);
	});

	it('contains Borrow link', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const links = target.querySelectorAll('.nav-link');
		const texts = Array.from(links).map((l) => l.textContent?.trim());
		expect(texts).toContain('Borrow');

		unmount(component);
	});

	it('contains Earn link', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const links = target.querySelectorAll('.nav-link');
		const texts = Array.from(links).map((l) => l.textContent?.trim());
		expect(texts).toContain('Earn');

		unmount(component);
	});

	it('contains Stake link', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const links = target.querySelectorAll('.nav-link');
		const texts = Array.from(links).map((l) => l.textContent?.trim());
		expect(texts).toContain('Stake');

		unmount(component);
	});

	it('renders actions section with connect wallet button', () => {
		const target = document.createElement('div');
		const component = mount(TopBar, { target });

		const actions = target.querySelector('.actions');
		expect(actions).toBeTruthy();

		// Check for button with "Connect Wallet" text
		const button = target.querySelector('.actions button');
		expect(button).toBeTruthy();
		expect(button?.textContent).toContain('Connect Wallet');

		unmount(component);
	});
});
