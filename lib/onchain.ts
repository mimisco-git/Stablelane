import { getNetworkConfig, type EnvironmentName } from "@/lib/networks";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export async function getActiveWalletAddress() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
  return accounts?.[0] || null;
}

export async function ensureSelectedNetwork(environment: EnvironmentName) {
  const network = getNetworkConfig(environment);
  if (typeof window === "undefined" || !window.ethereum || !network.hasCompleteConfig) {
    return { ok: false, reason: "Wallet or network config unavailable." };
  }

  const current = (await window.ethereum.request({ method: "eth_chainId" })) as string;
  const currentId = current ? parseInt(current, 16) : null;

  if (currentId === network.chainId) return { ok: true, reason: "" };

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
    return { ok: true, reason: "" };
  } catch {
    return { ok: false, reason: "Switch to the selected network in your wallet first." };
  }
}

export async function sendNativeTransaction({
  environment,
  to,
  valueHex,
}: {
  environment: EnvironmentName;
  to: string;
  valueHex: string;
}) {
  const network = getNetworkConfig(environment);
  if (typeof window === "undefined" || !window.ethereum || !network.hasCompleteConfig) {
    throw new Error("Wallet or network config unavailable.");
  }

  const from = await getActiveWalletAddress();
  if (!from) throw new Error("Connect your wallet first.");

  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to,
        value: valueHex,
      },
    ],
  })) as string;

  return txHash;
}
