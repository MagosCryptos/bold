import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Input from '$lib/components/ui/Input.svelte';

describe('Input', () => {
	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				label: 'Username',
				value: ''
			}
		});

		const label = target.querySelector('label');
		expect(label?.textContent).toBe('Username');

		unmount(component);
	});

	it('renders input element', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				value: 'test value'
			}
		});

		const input = target.querySelector('input');
		expect(input).toBeTruthy();
		expect(input?.value).toBe('test value');

		unmount(component);
	});

	it('applies placeholder', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				placeholder: 'Enter text...',
				value: ''
			}
		});

		const input = target.querySelector('input');
		expect(input?.placeholder).toBe('Enter text...');

		unmount(component);
	});

	it('shows error state', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				error: 'This field is required',
				value: ''
			}
		});

		const wrapper = target.querySelector('.input-wrapper');
		expect(wrapper?.classList.contains('has-error')).toBe(true);

		const errorText = target.querySelector('.error');
		expect(errorText?.textContent).toBe('This field is required');

		unmount(component);
	});

	it('can be disabled', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				disabled: true,
				value: ''
			}
		});

		const input = target.querySelector('input');
		expect(input?.disabled).toBe(true);

		unmount(component);
	});

	it('supports different input types', () => {
		const target = document.createElement('div');
		const component = mount(Input, {
			target,
			props: {
				type: 'password',
				value: ''
			}
		});

		const input = target.querySelector('input');
		expect(input?.type).toBe('password');

		unmount(component);
	});
});
