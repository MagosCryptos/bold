import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		alias: {
			$lib: path.resolve('./src/lib'),
			'$app/stores': path.resolve('./tests/mocks/app-stores.ts'),
			'$env/static/public': path.resolve('./tests/mocks/env-static-public.ts')
		}
	},
	resolve: {
		conditions: ['browser']
	}
});
