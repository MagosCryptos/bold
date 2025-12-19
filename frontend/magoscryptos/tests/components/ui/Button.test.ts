import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
	it('renders with default props', () => {
		const target = document.createElement('div');
		const component = mount(Button, {
			target,
			props: {
				children: () => {
					const span = document.createElement('span');
					span.textContent = 'Click me';
					return span;
				}
			}
		});

		const button = target.querySelector('button');
		expect(button).toBeTruthy();
		expect(button?.classList.contains('button')).toBe(true);
		expect(button?.classList.contains('primary')).toBe(true);
		expect(button?.classList.contains('md')).toBe(true);

		unmount(component);
	});

	it('renders with secondary variant', () => {
		const target = document.createElement('div');
		const component = mount(Button, {
			target,
			props: {
				variant: 'secondary',
				children: () => document.createTextNode('Secondary')
			}
		});

		const button = target.querySelector('button');
		expect(button?.classList.contains('secondary')).toBe(true);

		unmount(component);
	});

	it('renders with different sizes', () => {
		const target = document.createElement('div');

		// Test small size
		let component = mount(Button, {
			target,
			props: {
				size: 'sm',
				children: () => document.createTextNode('Small')
			}
		});
		expect(target.querySelector('button')?.classList.contains('sm')).toBe(true);
		unmount(component);

		// Test large size
		target.innerHTML = '';
		component = mount(Button, {
			target,
			props: {
				size: 'lg',
				children: () => document.createTextNode('Large')
			}
		});
		expect(target.querySelector('button')?.classList.contains('lg')).toBe(true);
		unmount(component);
	});

	it('renders as disabled', () => {
		const target = document.createElement('div');
		const component = mount(Button, {
			target,
			props: {
				disabled: true,
				children: () => document.createTextNode('Disabled')
			}
		});

		const button = target.querySelector('button');
		expect(button?.disabled).toBe(true);

		unmount(component);
	});

	it('handles click events', () => {
		const target = document.createElement('div');
		const handleClick = vi.fn();
		const component = mount(Button, {
			target,
			props: {
				onclick: handleClick,
				children: () => document.createTextNode('Click')
			}
		});

		const button = target.querySelector('button');
		button?.click();
		expect(handleClick).toHaveBeenCalledTimes(1);

		unmount(component);
	});

	it('renders all variant types', () => {
		const variants = ['primary', 'secondary', 'tertiary', 'positive', 'negative'] as const;
		const target = document.createElement('div');

		for (const variant of variants) {
			target.innerHTML = '';
			const component = mount(Button, {
				target,
				props: {
					variant,
					children: () => document.createTextNode(variant)
				}
			});
			expect(target.querySelector('button')?.classList.contains(variant)).toBe(true);
			unmount(component);
		}
	});
});
