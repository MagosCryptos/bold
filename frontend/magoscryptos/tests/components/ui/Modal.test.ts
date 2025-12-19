import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Modal from '$lib/components/ui/Modal.svelte';

describe('Modal', () => {
	it('renders when open is true', () => {
		const target = document.createElement('div');
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				title: 'Test Modal',
				children: () => document.createTextNode('Modal content')
			}
		});

		const modal = target.querySelector('.modal-backdrop');
		expect(modal).toBeTruthy();

		const title = target.querySelector('.modal-title');
		expect(title?.textContent).toBe('Test Modal');

		unmount(component);
	});

	it('does not render when open is false', () => {
		const target = document.createElement('div');
		const component = mount(Modal, {
			target,
			props: {
				open: false,
				title: 'Hidden Modal',
				children: () => document.createTextNode('Modal content')
			}
		});

		const modal = target.querySelector('.modal-backdrop');
		expect(modal).toBeFalsy();

		unmount(component);
	});

	it('renders close button', () => {
		const target = document.createElement('div');
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				title: 'Closable Modal',
				children: () => document.createTextNode('Modal content')
			}
		});

		const closeButton = target.querySelector('.close-button');
		expect(closeButton).toBeTruthy();

		unmount(component);
	});

	it('calls onclose when close button is clicked', () => {
		const target = document.createElement('div');
		const handleClose = vi.fn();
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				title: 'Test Modal',
				onclose: handleClose,
				children: () => document.createTextNode('Modal content')
			}
		});

		const closeButton = target.querySelector('.close-button') as HTMLButtonElement;
		closeButton?.click();
		expect(handleClose).toHaveBeenCalledTimes(1);

		unmount(component);
	});

	it('calls onclose when backdrop is clicked', () => {
		const target = document.createElement('div');
		const handleClose = vi.fn();
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				title: 'Test Modal',
				onclose: handleClose,
				children: () => document.createTextNode('Modal content')
			}
		});

		const backdrop = target.querySelector('.modal-backdrop') as HTMLDivElement;
		backdrop?.click();
		expect(handleClose).toHaveBeenCalledTimes(1);

		unmount(component);
	});

	it('does not close when modal content is clicked', () => {
		const target = document.createElement('div');
		const handleClose = vi.fn();
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				title: 'Test Modal',
				onclose: handleClose,
				children: () => document.createTextNode('Modal content')
			}
		});

		const modal = target.querySelector('.modal') as HTMLDivElement;
		modal?.click();
		expect(handleClose).not.toHaveBeenCalled();

		unmount(component);
	});
});
