// Token approval utilities for ERC20 tokens

import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig, getBranchContract, getProtocolContract } from '$lib/web3';
import { erc20Abi, maxUint256 } from 'viem';
import type { Address } from '$lib/types';

/**
 * Check current allowance for a token
 */
export async function getAllowance(
	tokenAddress: Address,
	owner: Address,
	spender: Address
): Promise<bigint> {
	return readContract(wagmiConfig, {
		address: tokenAddress,
		abi: erc20Abi,
		functionName: 'allowance',
		args: [owner, spender]
	});
}

/**
 * Check if approval is needed for the specified amount
 */
export async function needsApproval(
	tokenAddress: Address,
	owner: Address,
	spender: Address,
	amount: bigint
): Promise<boolean> {
	const allowance = await getAllowance(tokenAddress, owner, spender);
	return allowance < amount;
}

/**
 * Approve token spending
 * @param tokenAddress - Token contract address
 * @param spender - Address to approve
 * @param amount - Amount to approve (defaults to max uint256 for infinite approval)
 * @returns Transaction hash
 */
export async function approveToken(
	tokenAddress: Address,
	spender: Address,
	amount: bigint = maxUint256
): Promise<`0x${string}`> {
	const hash = await writeContract(wagmiConfig, {
		address: tokenAddress,
		abi: erc20Abi,
		functionName: 'approve',
		args: [spender, amount]
	});

	// Wait for confirmation
	await waitForTransactionReceipt(wagmiConfig, {
		hash,
		confirmations: 1
	});

	return hash;
}

/**
 * Approve BOLD token for a specific spender
 */
export async function approveBold(
	spender: Address,
	amount: bigint = maxUint256
): Promise<`0x${string}`> {
	const boldToken = getProtocolContract('BoldToken');
	return approveToken(boldToken.address, spender, amount);
}

/**
 * Approve collateral token for BorrowerOperations
 */
export async function approveCollateralForBorrowing(
	branchId: number,
	amount: bigint = maxUint256
): Promise<`0x${string}`> {
	const collToken = getBranchContract(branchId, 'CollToken');
	const borrowerOps = getBranchContract(branchId, 'BorrowerOperations');
	return approveToken(collToken.address, borrowerOps.address, amount);
}

/**
 * Approve BOLD for StabilityPool deposits
 */
export async function approveBoldForStabilityPool(
	branchId: number,
	amount: bigint = maxUint256
): Promise<`0x${string}`> {
	const boldToken = getProtocolContract('BoldToken');
	const stabilityPool = getBranchContract(branchId, 'StabilityPool');
	return approveToken(boldToken.address, stabilityPool.address, amount);
}

/**
 * Check if collateral approval is needed for borrowing
 */
export async function needsCollateralApproval(
	branchId: number,
	owner: Address,
	amount: bigint
): Promise<boolean> {
	const collToken = getBranchContract(branchId, 'CollToken');
	const borrowerOps = getBranchContract(branchId, 'BorrowerOperations');
	return needsApproval(collToken.address, owner, borrowerOps.address, amount);
}

/**
 * Check if BOLD approval is needed for stability pool
 */
export async function needsBoldApprovalForStabilityPool(
	branchId: number,
	owner: Address,
	amount: bigint
): Promise<boolean> {
	const boldToken = getProtocolContract('BoldToken');
	const stabilityPool = getBranchContract(branchId, 'StabilityPool');
	return needsApproval(boldToken.address, owner, stabilityPool.address, amount);
}
