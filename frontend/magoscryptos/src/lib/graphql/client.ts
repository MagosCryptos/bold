import { GraphQLClient } from 'graphql-request';
import { PUBLIC_SUBGRAPH_URL } from '$env/static/public';

// Create GraphQL client for subgraph queries
export const graphqlClient = new GraphQLClient(
	PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/42403/bold/version/latest'
);

// Helper to check if subgraph is configured
export function isSubgraphConfigured(): boolean {
	return !!PUBLIC_SUBGRAPH_URL;
}
