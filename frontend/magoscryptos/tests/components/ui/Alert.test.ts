import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import Alert from '$lib/components/ui/Alert.svelte';

describe('Alert', () => {
	it('renders with info variant by default', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				children: () => document.createTextNode('Info message')
			}
		});

		const alert = target.querySelector('.alert');
		expect(alert).toBeTruthy();
		expect(alert?.classList.contains('info')).toBe(true);

		unmount(component);
	});

	it('renders warning variant', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				variant: 'warning',
				children: () => document.createTextNode('Warning message')
			}
		});

		const alert = target.querySelector('.alert');
		expect(alert?.classList.contains('warning')).toBe(true);

		unmount(component);
	});

	it('renders error variant', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				variant: 'error',
				children: () => document.createTextNode('Error message')
			}
		});

		const alert = target.querySelector('.alert');
		expect(alert?.classList.contains('error')).toBe(true);

		unmount(component);
	});

	it('renders success variant', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				variant: 'success',
				children: () => document.createTextNode('Success message')
			}
		});

		const alert = target.querySelector('.alert');
		expect(alert?.classList.contains('success')).toBe(true);

		unmount(component);
	});

	it('renders with title', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				title: 'Important',
				children: () => document.createTextNode('Message')
			}
		});

		const title = target.querySelector('.alert-title');
		expect(title?.textContent).toBe('Important');

		unmount(component);
	});

	it('does not render title when not provided', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				children: () => document.createTextNode('Message only')
			}
		});

		const title = target.querySelector('.alert-title');
		expect(title).toBeFalsy();

		unmount(component);
	});

	it('renders content container', () => {
		const target = document.createElement('div');
		const component = mount(Alert, {
			target,
			props: {
				children: () => document.createTextNode('Content')
			}
		});

		const content = target.querySelector('.alert-content');
		expect(content).toBeTruthy();

		unmount(component);
	});
});
