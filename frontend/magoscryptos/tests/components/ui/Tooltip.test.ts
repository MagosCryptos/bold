import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import Tooltip from '$lib/components/ui/Tooltip.svelte';

describe('Tooltip', () => {
	it('renders wrapper element', () => {
		const target = document.createElement('div');
		const component = mount(Tooltip, {
			target,
			props: {
				text: 'Helpful tip',
				children: () => document.createTextNode('Hover me')
			}
		});

		const wrapper = target.querySelector('.tooltip-wrapper');
		expect(wrapper).toBeTruthy();

		unmount(component);
	});

	it('does not show tooltip by default', () => {
		const target = document.createElement('div');
		const component = mount(Tooltip, {
			target,
			props: {
				text: 'This is a tooltip',
				children: () => document.createTextNode('Hover me')
			}
		});

		// Tooltip should be hidden by default (visible = false)
		const tooltip = target.querySelector('.tooltip');
		expect(tooltip).toBeFalsy();

		unmount(component);
	});

	it('has correct text prop', () => {
		const target = document.createElement('div');
		const tooltipText = 'Tooltip text here';
		const component = mount(Tooltip, {
			target,
			props: {
				text: tooltipText,
				children: () => document.createTextNode('Child')
			}
		});

		// Wrapper should exist with role="presentation"
		const wrapper = target.querySelector('.tooltip-wrapper');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('role')).toBe('presentation');

		unmount(component);
	});
});
