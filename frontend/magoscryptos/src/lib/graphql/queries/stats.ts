import { gql } from 'graphql-request';

// Query all interest rate brackets to calculate total debt per branch
export const INTEREST_RATE_BRACKETS = gql`
	query AllInterestRateBrackets {
		interestRateBrackets(first: 1000, where: { totalDebt_gt: 0 }, orderBy: rate) {
			collateral {
				collIndex
			}
			rate
			totalDebt
		}
	}
`;

// Query to count active troves per collateral
export const ACTIVE_TROVES_COUNT = gql`
	query ActiveTrovesCount {
		coll0: troves(where: { collateral: "0", status: active }, first: 1000) {
			id
		}
		coll1: troves(where: { collateral: "1", status: active }, first: 1000) {
			id
		}
		coll2: troves(where: { collateral: "2", status: active }, first: 1000) {
			id
		}
	}
`;

// Query collateral info
export const COLLATERALS = gql`
	query Collaterals {
		collaterals {
			id
			collIndex
			minCollRatio
		}
	}
`;

// Response types
export interface InterestRateBracket {
	collateral: {
		collIndex: number;
	};
	rate: string;
	totalDebt: string;
}

export interface InterestRateBracketsResponse {
	interestRateBrackets: InterestRateBracket[];
}

export interface ActiveTrovesCountResponse {
	coll0: { id: string }[];
	coll1: { id: string }[];
	coll2: { id: string }[];
}

export interface CollateralInfo {
	id: string;
	collIndex: number;
	minCollRatio: string;
}

export interface CollateralsResponse {
	collaterals: CollateralInfo[];
}

// Aggregated protocol stats
export interface BranchStats {
	collateralIndex: number;
	collateralSymbol: string;
	totalDebt: bigint;
	activeTroves: number;
	minCollRatio: number; // As percentage (e.g., 110 for 110%)
}

export interface ProtocolStats {
	branches: BranchStats[];
	totalDebt: bigint;
	totalActiveTroves: number;
}
