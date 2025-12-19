import { readable } from 'svelte/store';

export const page = readable({
	params: {},
	url: new URL('http://localhost'),
	route: { id: '/' }
});

export const navigating = readable(null);

export const updated = {
	subscribe: readable(false).subscribe,
	check: async () => false
};
