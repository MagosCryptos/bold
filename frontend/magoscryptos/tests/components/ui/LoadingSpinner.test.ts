import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

describe('LoadingSpinner', () => {
	it('renders with default size (md)', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, { target });

		const spinner = target.querySelector('.loading-spinner');
		expect(spinner).toBeTruthy();
		expect(spinner?.classList.contains('md')).toBe(true);

		unmount(component);
	});

	it('renders with small size', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, {
			target,
			props: {
				size: 'sm'
			}
		});

		const spinner = target.querySelector('.loading-spinner');
		expect(spinner?.classList.contains('sm')).toBe(true);

		unmount(component);
	});

	it('renders with large size', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, {
			target,
			props: {
				size: 'lg'
			}
		});

		const spinner = target.querySelector('.loading-spinner');
		expect(spinner?.classList.contains('lg')).toBe(true);

		unmount(component);
	});

	it('renders with label', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, {
			target,
			props: {
				label: 'Loading data...'
			}
		});

		const label = target.querySelector('.label');
		expect(label?.textContent).toBe('Loading data...');

		unmount(component);
	});

	it('does not render label when not provided', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, { target });

		const label = target.querySelector('.label');
		expect(label).toBeFalsy();

		unmount(component);
	});

	it('has spinner element', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, { target });

		const spinner = target.querySelector('.spinner');
		expect(spinner).toBeTruthy();

		unmount(component);
	});

	it('has accessible role and aria-label', () => {
		const target = document.createElement('div');
		const component = mount(LoadingSpinner, {
			target,
			props: {
				label: 'Please wait'
			}
		});

		const container = target.querySelector('.loading-spinner');
		expect(container?.getAttribute('role')).toBe('status');
		expect(container?.getAttribute('aria-label')).toBe('Please wait');

		unmount(component);
	});
});
