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


export function toBaseUnits(amount: string, decimals: number) {
  const normalized = (amount || "0").trim();
  if (!normalized) return "0";

  const [wholeRaw, fractionRaw = ""] = normalized.split(".");
  const whole = wholeRaw.replace(/[^0-9]/g, "") || "0";
  const fraction = fractionRaw.replace(/[^0-9]/g, "").slice(0, decimals);
  const paddedFraction = (fraction + "0".repeat(decimals)).slice(0, decimals);

  const combined = `${whole}${paddedFraction}`.replace(/^0+/, "") || "0";
  return combined;
}

function stripHexPrefix(value: string) {
  return value.startsWith("0x") ? value.slice(2) : value;
}

function padHex(value: string, targetLength: number) {
  return stripHexPrefix(value).padStart(targetLength, "0");
}

export function encodeErc20TransferData(to: string, amountUnits: string) {
  const method = "a9059cbb";
  const addressPart = padHex(to.toLowerCase(), 64);
  const amountHex = BigInt(amountUnits || "0").toString(16);
  const amountPart = padHex(amountHex, 64);
  return `0x${method}${addressPart}${amountPart}`;
}

export async function sendContractTransaction({
  environment,
  to,
  data,
  valueHex = "0x0",
}: {
  environment: EnvironmentName;
  to: string;
  data: string;
  valueHex?: string;
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
        data,
      },
    ],
  })) as string;

  return txHash;
}

export async function sendErc20Transfer({
  environment,
  tokenAddress,
  to,
  amount,
  decimals,
}: {
  environment: EnvironmentName;
  tokenAddress: string;
  to: string;
  amount: string;
  decimals: number;
}) {
  const amountUnits = toBaseUnits(amount, decimals);
  const data = encodeErc20TransferData(to, amountUnits);
  return sendContractTransaction({
    environment,
    to: tokenAddress,
    data,
  });
}
