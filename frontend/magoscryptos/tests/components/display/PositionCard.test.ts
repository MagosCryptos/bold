import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import PositionCard from '$lib/components/display/PositionCard.svelte';

describe('PositionCard', () => {
	describe('borrow type', () => {
		it('renders borrow position', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'borrow',
					collateralSymbol: 'ETH',
					collateralAmount: 5.0,
					debtAmount: 10000,
					interestRate: 5.5,
					riskLevel: 'low'
				}
			});

			const card = target.querySelector('.position-card');
			expect(card).toBeTruthy();

			const typeBadge = target.querySelector('.type-badge.borrow');
			expect(typeBadge).toBeTruthy();

			unmount(component);
		});

		it('displays collateral information', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'borrow',
					collateralSymbol: 'ETH',
					collateralAmount: 5.0,
					debtAmount: 10000,
					interestRate: 5.5,
					riskLevel: 'low'
				}
			});

			expect(target.textContent).toContain('ETH');
			expect(target.textContent).toContain('Collateral');

			unmount(component);
		});

		it('displays debt amount', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'borrow',
					collateralSymbol: 'ETH',
					collateralAmount: 5.0,
					debtAmount: 10000,
					interestRate: 5.5,
					riskLevel: 'low'
				}
			});

			expect(target.textContent).toContain('Debt');
			expect(target.textContent).toContain('BOLD');

			unmount(component);
		});

		it('displays interest rate', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'borrow',
					collateralSymbol: 'ETH',
					collateralAmount: 5.0,
					debtAmount: 10000,
					interestRate: 5.5,
					riskLevel: 'low'
				}
			});

			expect(target.textContent).toContain('Interest');
			expect(target.textContent).toContain('%');

			unmount(component);
		});

		it('displays risk badge', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'borrow',
					collateralSymbol: 'ETH',
					collateralAmount: 5.0,
					debtAmount: 10000,
					interestRate: 5.5,
					riskLevel: 'high'
				}
			});

			const riskBadge = target.querySelector('.risk-badge');
			expect(riskBadge).toBeTruthy();
			expect(riskBadge?.classList.contains('high')).toBe(true);

			unmount(component);
		});
	});

	describe('earn type', () => {
		it('renders earn position', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'earn',
					collateralSymbol: 'ETH',
					depositAmount: 5000,
					apr: 8.5,
					earnedAmount: 125
				}
			});

			const card = target.querySelector('.position-card');
			expect(card).toBeTruthy();

			const typeBadge = target.querySelector('.type-badge.earn');
			expect(typeBadge).toBeTruthy();

			unmount(component);
		});

		it('displays pool information', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'earn',
					collateralSymbol: 'ETH',
					depositAmount: 5000,
					apr: 8.5,
					earnedAmount: 125
				}
			});

			expect(target.textContent).toContain('ETH');
			expect(target.textContent).toContain('Deposited');

			unmount(component);
		});

		it('displays APR', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'earn',
					collateralSymbol: 'ETH',
					depositAmount: 5000,
					apr: 8.5,
					earnedAmount: 125
				}
			});

			expect(target.textContent).toContain('APR');
			expect(target.textContent).toContain('%');

			unmount(component);
		});

		it('displays earned amount', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'earn',
					collateralSymbol: 'ETH',
					depositAmount: 5000,
					apr: 8.5,
					earnedAmount: 125
				}
			});

			expect(target.textContent).toContain('Earned');

			unmount(component);
		});
	});

	describe('stake type', () => {
		it('renders stake position', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'stake',
					depositAmount: 25000,
					earnedAmount: 500
				}
			});

			const card = target.querySelector('.position-card');
			expect(card).toBeTruthy();

			const typeBadge = target.querySelector('.type-badge.stake');
			expect(typeBadge).toBeTruthy();

			unmount(component);
		});

		it('displays staked amount', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'stake',
					depositAmount: 25000,
					earnedAmount: 500
				}
			});

			expect(target.textContent).toContain('Staked');
			expect(target.textContent).toContain('LQTY');

			unmount(component);
		});

		it('displays voting power', () => {
			const target = document.createElement('div');
			const component = mount(PositionCard, {
				target,
				props: {
					type: 'stake',
					depositAmount: 25000,
					earnedAmount: 500
				}
			});

			expect(target.textContent).toContain('Voting Power');

			unmount(component);
		});
	});

	it('is rendered as a link', () => {
		const target = document.createElement('div');
		const component = mount(PositionCard, {
			target,
			props: {
				type: 'borrow',
				collateralSymbol: 'ETH',
				collateralAmount: 5.0,
				debtAmount: 10000,
				interestRate: 5.5,
				riskLevel: 'low',
				href: '/loan/123'
			}
		});

		const link = target.querySelector('a.position-card');
		expect(link).toBeTruthy();
		expect(link?.getAttribute('href')).toBe('/loan/123');

		unmount(component);
	});
});
