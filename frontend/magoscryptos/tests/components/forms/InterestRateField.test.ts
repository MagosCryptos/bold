import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import InterestRateField from '$lib/components/forms/InterestRateField.svelte';

describe('InterestRateField', () => {
	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'manual'
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Interest Rate');

		unmount(component);
	});

	it('renders mode toggle buttons', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'manual'
			}
		});

		const buttons = target.querySelectorAll('.mode-button');
		expect(buttons.length).toBe(2);
		expect(buttons[0].textContent).toBe('Manual');
		expect(buttons[1].textContent).toBe('Delegate');

		unmount(component);
	});

	it('marks manual mode as active', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'manual'
			}
		});

		const buttons = target.querySelectorAll('.mode-button');
		expect(buttons[0].classList.contains('active')).toBe(true);
		expect(buttons[1].classList.contains('active')).toBe(false);

		unmount(component);
	});

	it('marks delegate mode as active', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'delegate'
			}
		});

		const buttons = target.querySelectorAll('.mode-button');
		expect(buttons[0].classList.contains('active')).toBe(false);
		expect(buttons[1].classList.contains('active')).toBe(true);

		unmount(component);
	});

	it('renders input in manual mode', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'manual'
			}
		});

		const input = target.querySelector('input');
		expect(input).toBeTruthy();
		expect(input?.value).toBe('5.5');

		unmount(component);
	});

	it('hides input in delegate mode', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'delegate'
			}
		});

		const input = target.querySelector('input');
		expect(input).toBeFalsy();

		const delegateInfo = target.querySelector('.delegate-info');
		expect(delegateInfo).toBeTruthy();

		unmount(component);
	});

	it('renders percentage suffix in manual mode', () => {
		const target = document.createElement('div');
		const component = mount(InterestRateField, {
			target,
			props: {
				value: '5.5',
				mode: 'manual'
			}
		});

		const suffix = target.querySelector('.suffix');
		expect(suffix?.textContent).toBe('%');

		unmount(component);
	});
});
