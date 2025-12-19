// Web3 configuration and utilities
export { chain, CHAIN_CONFIG } from './config';
export { wagmiConfig, getAppKit, openWalletModal, closeWalletModal } from './appkit';
export {
	getBranchContract,
	getProtocolContract,
	BRANCHES,
	getBranch,
	PROTOCOL_CONTRACTS,
	type BranchContractName,
	type ProtocolContractName,
	type Contract
} from './contracts';
export { WALLET_CONNECT_PROJECT_ID } from './env';
