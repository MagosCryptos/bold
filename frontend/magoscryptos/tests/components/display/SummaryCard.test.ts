import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import SummaryCard from '$lib/components/display/SummaryCard.svelte';

describe('SummaryCard', () => {
	it('renders with title', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary'
			}
		});

		const title = target.querySelector('.title');
		expect(title?.textContent).toBe('Summary');

		unmount(component);
	});

	it('renders description when provided', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				description: 'This is a description'
			}
		});

		const description = target.querySelector('.description');
		expect(description?.textContent).toBe('This is a description');

		unmount(component);
	});

	it('does not render description when not provided', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary'
			}
		});

		const description = target.querySelector('.description');
		expect(description).toBeFalsy();

		unmount(component);
	});

	it('renders grid when items provided', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				items: [
					{ label: 'Item 1', value: () => document.createTextNode('Value 1') },
					{ label: 'Item 2', value: () => document.createTextNode('Value 2') }
				]
			}
		});

		const grid = target.querySelector('.grid');
		expect(grid).toBeTruthy();

		const items = target.querySelectorAll('.item');
		expect(items.length).toBe(2);

		unmount(component);
	});

	it('renders item labels', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				items: [
					{ label: 'Test Label', value: () => document.createTextNode('Value') }
				]
			}
		});

		const label = target.querySelector('.item-label');
		expect(label?.textContent).toBe('Test Label');

		unmount(component);
	});

	it('applies highlight class to highlighted items', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				items: [
					{ label: 'Highlighted', value: () => document.createTextNode('Value'), highlight: true }
				]
			}
		});

		const item = target.querySelector('.item');
		expect(item?.classList.contains('highlight')).toBe(true);

		unmount(component);
	});

	it('applies columns class based on columns prop', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				columns: 3,
				items: [
					{ label: 'Item', value: () => document.createTextNode('Value') }
				]
			}
		});

		const grid = target.querySelector('.grid');
		expect(grid?.classList.contains('columns-3')).toBe(true);

		unmount(component);
	});

	it('defaults to 2 columns', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				items: [
					{ label: 'Item', value: () => document.createTextNode('Value') }
				]
			}
		});

		const grid = target.querySelector('.grid');
		expect(grid?.classList.contains('columns-2')).toBe(true);

		unmount(component);
	});

	it('renders container with summary-card class', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary'
			}
		});

		const card = target.querySelector('.summary-card');
		expect(card).toBeTruthy();

		unmount(component);
	});

	it('renders children content when provided', () => {
		const target = document.createElement('div');
		const component = mount(SummaryCard, {
			target,
			props: {
				title: 'Summary',
				children: () => document.createTextNode('Custom content')
			}
		});

		const content = target.querySelector('.content');
		expect(content).toBeTruthy();

		unmount(component);
	});
});
