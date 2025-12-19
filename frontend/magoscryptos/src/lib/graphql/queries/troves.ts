import { gql } from 'graphql-request';

// Query to get all troves for a specific borrower
export const TROVES_BY_ACCOUNT = gql`
	query TrovesByAccount($borrower: String!) {
		troves(
			where: { borrower: $borrower }
			orderBy: updatedAt
			orderDirection: desc
		) {
			id
			troveId
			borrower
			status
			collateral {
				id
				collIndex
			}
			deposit
			debt
			stake
			interestRate
			interestBatch {
				id
				batchManager
				annualInterestRate
				annualManagementFee
			}
			createdAt
			updatedAt
			closedAt
			mightBeLeveraged
		}
	}
`;

// Query for active troves only
export const ACTIVE_TROVES_BY_ACCOUNT = gql`
	query ActiveTrovesByAccount($borrower: String!) {
		troves(
			where: { borrower: $borrower, status: active }
			orderBy: updatedAt
			orderDirection: desc
		) {
			id
			troveId
			borrower
			status
			collateral {
				id
				collIndex
			}
			deposit
			debt
			stake
			interestRate
			interestBatch {
				id
				batchManager
				annualInterestRate
				annualManagementFee
			}
			createdAt
			updatedAt
			mightBeLeveraged
		}
	}
`;

// Query for a specific trove by ID
export const TROVE_BY_ID = gql`
	query TroveById($id: ID!) {
		trove(id: $id) {
			id
			troveId
			borrower
			status
			collateral {
				id
				collIndex
			}
			deposit
			debt
			stake
			interestRate
			interestBatch {
				id
				batchManager
				annualInterestRate
				annualManagementFee
			}
			createdAt
			updatedAt
			closedAt
			mightBeLeveraged
		}
	}
`;

// Query for borrower info (trove counts)
export const BORROWER_INFO = gql`
	query BorrowerInfo($id: ID!) {
		borrowerInfo(id: $id) {
			id
			troves
			trovesByCollateral
		}
	}
`;
