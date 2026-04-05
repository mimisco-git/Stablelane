export type EnvironmentName = "testnet" | "mainnet";

export type NetworkConfig = {
  key: EnvironmentName;
  label: string;
  mode: "active" | "preview";
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasToken: string;
  hasCompleteConfig: boolean;
};

const testnet: NetworkConfig = {
  key: "testnet",
  label: "Arc testnet",
  mode: "active",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network",
  chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || 5042002),
  explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL || "https://testnet.arcscan.app",
  gasToken: process.env.NEXT_PUBLIC_ARC_GAS_TOKEN || "USDC",
  hasCompleteConfig: true,
};

const mainnetRpc = process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_URL || "";
const mainnetChainId = Number(process.env.NEXT_PUBLIC_ARC_MAINNET_CHAIN_ID || 0);
const mainnetExplorer = process.env.NEXT_PUBLIC_ARC_MAINNET_EXPLORER_URL || "";
const mainnetGas = process.env.NEXT_PUBLIC_ARC_MAINNET_GAS_TOKEN || "USDC";

const mainnet: NetworkConfig = {
  key: "mainnet",
  label: "Arc mainnet",
  mode: mainnetRpc && mainnetChainId && mainnetExplorer ? "active" : "preview",
  rpcUrl: mainnetRpc,
  chainId: mainnetChainId,
  explorerUrl: mainnetExplorer,
  gasToken: mainnetGas,
  hasCompleteConfig: Boolean(mainnetRpc && mainnetChainId && mainnetExplorer),
};

export const networks: Record<EnvironmentName, NetworkConfig> = {
  testnet,
  mainnet,
};

export function getNetworkConfig(environment: EnvironmentName) {
  return networks[environment];
}
