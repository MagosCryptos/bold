// Stake LQTY flow - deposit/withdraw LQTY to Governance

import { writeContract, readContract } from '@wagmi/core';
import { wagmiConfig, getProtocolContract } from '$lib/web3';
import { needsApproval, approveToken } from '../approvals';
import type {
	StakeLqtyRequest,
	UnstakeLqtyRequest,
	ClaimStakingRewardsRequest,
	TxStepDefinition
} from '../types';
import type { Address } from '$lib/types';

/**
 * Check if user has deployed a proxy for staking
 */
async function hasUserProxy(account: Address): Promise<boolean> {
	const governance = getProtocolContract('Governance');

	try {
		const proxyAddress = await readContract(wagmiConfig, {
			...governance,
			functionName: 'deriveUserProxyAddress',
			args: [account]
		});

		// Check if proxy is deployed by checking bytecode
		const code = await readContract(wagmiConfig, {
			address: proxyAddress as Address,
			abi: [{ type: 'function', name: 'owner', inputs: [], outputs: [{ type: 'address' }] }],
			functionName: 'owner'
		}).catch(() => null);

		return code !== null;
	} catch {
		return false;
	}
}

/**
 * Get user's proxy address
 */
async function getUserProxyAddress(account: Address): Promise<Address> {
	const governance = getProtocolContract('Governance');

	return readContract(wagmiConfig, {
		...governance,
		functionName: 'deriveUserProxyAddress',
		args: [account]
	}) as Promise<Address>;
}

/**
 * Build steps for staking LQTY
 */
export async function getStakeLqtySteps(request: StakeLqtyRequest): Promise<TxStepDefinition[]> {
	const steps: TxStepDefinition[] = [];
	const governance = getProtocolContract('Governance');
	const lqtyToken = getProtocolContract('LqtyToken');

	// Check if user proxy exists
	const hasProxy = await hasUserProxy(request.account);

	if (!hasProxy) {
		steps.push({
			id: 'deployProxy',
			label: 'Initialize Staking',
			execute: async () => {
				return writeContract(wagmiConfig, {
					...governance,
					functionName: 'deployUserProxy'
				});
			}
		});
	}

	// Get user proxy address for approval
	const proxyAddress = await getUserProxyAddress(request.account);

	// Check if LQTY approval is needed
	const needsLqtyApproval = await needsApproval(
		lqtyToken.address,
		request.account,
		proxyAddress,
		request.amount
	);

	if (needsLqtyApproval) {
		steps.push({
			id: 'approve',
			label: 'Approve LQTY',
			execute: async () => {
				return approveToken(lqtyToken.address, proxyAddress, request.amount);
			}
		});
	}

	// Deposit step
	steps.push({
		id: 'stake',
		label: 'Stake LQTY',
		execute: async () => {
			return writeContract(wagmiConfig, {
				...governance,
				functionName: 'depositLQTY',
				args: [request.amount]
			});
		}
	});

	return steps;
}

/**
 * Build steps for unstaking LQTY
 */
export async function getUnstakeLqtySteps(request: UnstakeLqtyRequest): Promise<TxStepDefinition[]> {
	const governance = getProtocolContract('Governance');

	return [
		{
			id: 'unstake',
			label: 'Unstake LQTY',
			execute: async () => {
				return writeContract(wagmiConfig, {
					...governance,
					functionName: 'withdrawLQTY',
					args: [request.amount]
				});
			}
		}
	];
}

/**
 * Build steps for claiming staking rewards
 */
export async function getClaimStakingRewardsSteps(
	request: ClaimStakingRewardsRequest
): Promise<TxStepDefinition[]> {
	const governance = getProtocolContract('Governance');

	return [
		{
			id: 'claim',
			label: 'Claim Rewards',
			execute: async () => {
				return writeContract(wagmiConfig, {
					...governance,
					functionName: 'claimFromStakingV1',
					args: [request.account]
				});
			}
		}
	];
}

/**
 * Get flow definition for staking LQTY
 */
export function getStakeLqtyFlowDefinition(request: StakeLqtyRequest) {
	return {
		title: 'Stake LQTY',
		getSteps: () => getStakeLqtySteps(request),
		getSuccessMessage: () => 'Successfully staked LQTY',
		getBackLink: () => ({ path: '/stake', label: 'Back to Stake' }),
		getSuccessLink: () => ({ path: '/stake', label: 'View Stake' })
	};
}

/**
 * Get flow definition for unstaking LQTY
 */
export function getUnstakeLqtyFlowDefinition(request: UnstakeLqtyRequest) {
	return {
		title: 'Unstake LQTY',
		getSteps: () => getUnstakeLqtySteps(request),
		getSuccessMessage: () => 'Successfully unstaked LQTY',
		getBackLink: () => ({ path: '/stake', label: 'Back to Stake' }),
		getSuccessLink: () => ({ path: '/stake', label: 'View Stake' })
	};
}

/**
 * Get flow definition for claiming staking rewards
 */
export function getClaimStakingRewardsFlowDefinition(request: ClaimStakingRewardsRequest) {
	return {
		title: 'Claim Staking Rewards',
		getSteps: () => getClaimStakingRewardsSteps(request),
		getSuccessMessage: () => 'Successfully claimed staking rewards',
		getBackLink: () => ({ path: '/stake', label: 'Back to Stake' }),
		getSuccessLink: () => ({ path: '/stake', label: 'View Stake' })
	};
}
