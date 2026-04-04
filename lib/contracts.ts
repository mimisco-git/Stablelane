import { getNetworkConfig, type EnvironmentName } from "@/lib/networks";

export type EscrowContractConfig = {
  factoryAddress: string;
  implementationAddress: string;
  releaseModuleAddress: string;
  ready: boolean;
};

function makeConfig(prefix: "NEXT_PUBLIC_TESTNET" | "NEXT_PUBLIC_MAINNET"): EscrowContractConfig {
  const factoryAddress = process.env[`${prefix}_ESCROW_FACTORY_ADDRESS`] || "";
  const implementationAddress = process.env[`${prefix}_ESCROW_IMPLEMENTATION_ADDRESS`] || "";
  const releaseModuleAddress = process.env[`${prefix}_ESCROW_RELEASE_MODULE_ADDRESS`] || "";

  return {
    factoryAddress,
    implementationAddress,
    releaseModuleAddress,
    ready: Boolean(factoryAddress && implementationAddress && releaseModuleAddress),
  };
}

export function getEscrowContractConfig(environment: EnvironmentName) {
  return environment === "testnet"
    ? makeConfig("NEXT_PUBLIC_TESTNET")
    : makeConfig("NEXT_PUBLIC_MAINNET");
}

export function getEscrowExplorerLink(environment: EnvironmentName, address: string) {
  const network = getNetworkConfig(environment);
  if (!network.explorerUrl || !address) return "";
  return `${network.explorerUrl}/address/${address}`;
}
