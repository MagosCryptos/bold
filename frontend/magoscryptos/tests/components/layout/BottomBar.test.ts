import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import BottomBar from '$lib/components/layout/BottomBar.svelte';

describe('BottomBar', () => {
	it('renders bottombar container', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const bottombar = target.querySelector('.bottombar');
		expect(bottombar).toBeTruthy();

		unmount(component);
	});

	it('renders navigation items', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const links = target.querySelectorAll('.nav-item');
		expect(links.length).toBeGreaterThan(0);

		unmount(component);
	});

	it('contains Home link', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const labels = target.querySelectorAll('.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toContain('Home');

		unmount(component);
	});

	it('contains Borrow link', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const labels = target.querySelectorAll('.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toContain('Borrow');

		unmount(component);
	});

	it('contains Earn link', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const labels = target.querySelectorAll('.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toContain('Earn');

		unmount(component);
	});

	it('contains Stake link', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const labels = target.querySelectorAll('.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toContain('Stake');

		unmount(component);
	});

	it('contains Account link', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const labels = target.querySelectorAll('.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toContain('Account');

		unmount(component);
	});

	it('renders icons for each nav item', () => {
		const target = document.createElement('div');
		const component = mount(BottomBar, { target });

		const icons = target.querySelectorAll('.icon');
		expect(icons.length).toBeGreaterThan(0);

		unmount(component);
	});
});
