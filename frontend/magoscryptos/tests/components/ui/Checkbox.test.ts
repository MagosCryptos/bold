import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Checkbox from '$lib/components/ui/Checkbox.svelte';

describe('Checkbox', () => {
	it('renders unchecked by default', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, { target });

		const input = target.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input?.checked).toBe(false);

		unmount(component);
	});

	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, {
			target,
			props: {
				label: 'Accept terms'
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Accept terms');

		unmount(component);
	});

	it('renders checked when checked prop is true', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, {
			target,
			props: {
				checked: true
			}
		});

		const input = target.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input?.checked).toBe(true);

		unmount(component);
	});

	it('can be disabled', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, {
			target,
			props: {
				disabled: true
			}
		});

		const input = target.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input?.disabled).toBe(true);

		const container = target.querySelector('.checkbox');
		expect(container?.classList.contains('disabled')).toBe(true);

		unmount(component);
	});

	it('has checkmark element', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, { target });

		const checkmark = target.querySelector('.checkmark');
		expect(checkmark).toBeTruthy();

		unmount(component);
	});

	it('renders container with checkbox class', () => {
		const target = document.createElement('div');
		const component = mount(Checkbox, { target });

		const container = target.querySelector('.checkbox');
		expect(container).toBeTruthy();

		unmount(component);
	});
});
