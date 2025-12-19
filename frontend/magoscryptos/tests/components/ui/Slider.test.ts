import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Slider from '$lib/components/ui/Slider.svelte';

describe('Slider', () => {
	it('renders range input', () => {
		const target = document.createElement('div');
		const component = mount(Slider, { target });

		const input = target.querySelector('input[type="range"]');
		expect(input).toBeTruthy();

		unmount(component);
	});

	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				label: 'Leverage'
			}
		});

		const label = target.querySelector('.slider-label');
		expect(label?.textContent).toBe('Leverage');

		unmount(component);
	});

	it('renders with value label', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				valueLabel: '2.5x'
			}
		});

		const value = target.querySelector('.slider-value');
		expect(value?.textContent).toBe('2.5x');

		unmount(component);
	});

	it('shows range labels by default', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				min: 1,
				max: 10
			}
		});

		const range = target.querySelector('.slider-range');
		expect(range).toBeTruthy();
		expect(range?.textContent).toContain('1');
		expect(range?.textContent).toContain('10');

		unmount(component);
	});

	it('uses custom range labels', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				minLabel: '1.1x',
				maxLabel: '5.0x'
			}
		});

		const range = target.querySelector('.slider-range');
		expect(range?.textContent).toContain('1.1x');
		expect(range?.textContent).toContain('5.0x');

		unmount(component);
	});

	it('can hide range labels', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				showRange: false
			}
		});

		const range = target.querySelector('.slider-range');
		expect(range).toBeFalsy();

		unmount(component);
	});

	it('can be disabled', () => {
		const target = document.createElement('div');
		const component = mount(Slider, {
			target,
			props: {
				disabled: true
			}
		});

		const input = target.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input?.disabled).toBe(true);

		const container = target.querySelector('.slider-container');
		expect(container?.classList.contains('disabled')).toBe(true);

		unmount(component);
	});

	it('renders container with slider-container class', () => {
		const target = document.createElement('div');
		const component = mount(Slider, { target });

		const container = target.querySelector('.slider-container');
		expect(container).toBeTruthy();

		unmount(component);
	});
});
