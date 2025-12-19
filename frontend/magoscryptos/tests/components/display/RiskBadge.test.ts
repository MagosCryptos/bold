import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import RiskBadge from '$lib/components/display/RiskBadge.svelte';

describe('RiskBadge', () => {
	it('renders low risk level', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'low'
			}
		});

		const badge = target.querySelector('.risk-badge');
		expect(badge?.textContent).toContain('Low Risk');
		expect(badge?.classList.contains('low')).toBe(true);

		unmount(component);
	});

	it('renders medium risk level', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'medium'
			}
		});

		const badge = target.querySelector('.risk-badge');
		expect(badge?.textContent).toContain('Medium Risk');
		expect(badge?.classList.contains('medium')).toBe(true);

		unmount(component);
	});

	it('renders high risk level', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'high'
			}
		});

		const badge = target.querySelector('.risk-badge');
		expect(badge?.textContent).toContain('High Risk');
		expect(badge?.classList.contains('high')).toBe(true);

		unmount(component);
	});

	it('renders critical risk level', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'critical'
			}
		});

		const badge = target.querySelector('.risk-badge');
		expect(badge?.textContent).toContain('Critical');
		expect(badge?.classList.contains('critical')).toBe(true);

		unmount(component);
	});

	it('has correct base class', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'low'
			}
		});

		const badge = target.querySelector('.risk-badge');
		expect(badge).toBeTruthy();

		unmount(component);
	});

	it('renders dot indicator', () => {
		const target = document.createElement('div');
		const component = mount(RiskBadge, {
			target,
			props: {
				level: 'low'
			}
		});

		const dot = target.querySelector('.dot');
		expect(dot).toBeTruthy();

		unmount(component);
	});
});
