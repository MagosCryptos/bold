import { gql } from 'graphql-request';

// Query to fetch interest batches by their IDs
export const INTEREST_BATCHES = gql`
	query InterestBatches($ids: [ID!]!) {
		interestBatches(where: { id_in: $ids }) {
			id
			collateral {
				collIndex
			}
			batchManager
			debt
			coll
			annualInterestRate
			annualManagementFee
		}
	}
`;

// Query to get all interest batches for a specific collateral
export const INTEREST_BATCHES_BY_COLLATERAL = gql`
	query InterestBatchesByCollateral($collIndex: Int!) {
		interestBatches(
			where: { collateral_: { collIndex: $collIndex } }
			orderBy: debt
			orderDirection: desc
			first: 100
		) {
			id
			batchManager
			debt
			coll
			annualInterestRate
			annualManagementFee
		}
	}
`;
