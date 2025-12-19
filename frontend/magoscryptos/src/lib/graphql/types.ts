// GraphQL response types based on subgraph schema

export type TroveStatus = 'active' | 'closedByOwner' | 'closedByLiquidation' | 'closedByRedemption';

export interface Collateral {
	id: string;
	collIndex: number;
	minCollRatio: string;
}

export interface InterestBatch {
	id: string;
	batchManager: string;
	debt: string;
	coll: string;
	annualInterestRate: string;
	annualManagementFee: string;
}

export interface Trove {
	id: string;
	troveId: string;
	borrower: string;
	status: TroveStatus;
	collateral: {
		id: string;
		collIndex: number;
	};
	deposit: string;
	debt: string;
	stake: string;
	interestRate: string;
	interestBatch: InterestBatch | null;
	createdAt: string;
	updatedAt: string;
	closedAt: string | null;
	mightBeLeveraged: boolean;
}

export interface BorrowerInfo {
	id: string;
	troves: number;
	trovesByCollateral: number[];
}

// Query response types
export interface TrovesByAccountResponse {
	troves: Trove[];
}

export interface TroveByIdResponse {
	trove: Trove | null;
}

export interface BorrowerInfoResponse {
	borrowerInfo: BorrowerInfo | null;
}

// Formatted types for UI consumption
export interface FormattedTrove {
	id: string;
	troveId: string;
	collateralIndex: number;
	collateralSymbol: string;
	status: TroveStatus;
	deposit: bigint;
	debt: bigint;
	interestRate: bigint;
	interestRatePercent: number;
	collateralRatio: number | null; // Calculated with price
	isInBatch: boolean;
	batchManager: string | null;
	createdAt: Date;
	updatedAt: Date;
	mightBeLeveraged: boolean;
}

// Helper to convert subgraph trove to formatted trove
export function formatTrove(trove: Trove, collateralSymbols: string[]): FormattedTrove {
	const collIndex = trove.collateral.collIndex;
	const interestRate = BigInt(trove.interestRate);

	return {
		id: trove.id,
		troveId: trove.troveId,
		collateralIndex: collIndex,
		collateralSymbol: collateralSymbols[collIndex] || 'UNKNOWN',
		status: trove.status,
		deposit: BigInt(trove.deposit),
		debt: BigInt(trove.debt),
		interestRate,
		interestRatePercent: Number(interestRate) / 1e18 * 100,
		collateralRatio: null, // Set by caller with price data
		isInBatch: trove.interestBatch !== null,
		batchManager: trove.interestBatch?.batchManager || null,
		createdAt: new Date(Number(trove.createdAt) * 1000),
		updatedAt: new Date(Number(trove.updatedAt) * 1000),
		mightBeLeveraged: trove.mightBeLeveraged
	};
}

// Calculate collateral ratio given price
export function calculateCollateralRatio(
	deposit: bigint,
	debt: bigint,
	price: bigint
): number | null {
	if (debt === 0n) return null;
	// CR = (deposit * price) / debt
	// All values in 18 decimals, result as percentage
	const collValue = (deposit * price) / BigInt(1e18);
	return Number((collValue * BigInt(100)) / debt);
}
