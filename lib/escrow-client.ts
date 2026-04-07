"use client";

import { createWalletClient, createPublicClient, custom, http, parseUnits, type Hash } from "viem";
import { FACTORY_ABI, ESCROW_ABI, USDC_ABI } from "@/lib/escrow-abi";

// Arc testnet chain definition
export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const;

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_TESTNET_ESCROW_FACTORY_ADDRESS || "") as `0x${string}`;
const ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_TESTNET_ESCROW_ROUTER_ADDRESS || "") as `0x${string}`;
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_ARC_TESTNET_USDC || "0x3600000000000000000000000000000000000000") as `0x${string}`;

export { FACTORY_ADDRESS, ROUTER_ADDRESS, USDC_ADDRESS };

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum || null;
}

export function getPublicClient() {
  return createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });
}

export function getWalletClient() {
  const provider = getProvider();
  if (!provider) return null;
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(provider),
  });
}

export async function getConnectedAddress(): Promise<string | null> {
  const wallet = getWalletClient();
  if (!wallet) return null;
  try {
    const [address] = await wallet.getAddresses();
    return address || null;
  } catch {
    return null;
  }
}

/**
 * Create an on-chain escrow for a Stablelane invoice.
 * Client must have USDC approved and a connected wallet.
 */
export async function createOnChainEscrow({
  invoiceId,
  freelancerAddress,
  totalAmountUSDC,
  milestoneTitles,
  milestoneAmountsUSDC,
  disputeWindowDays = 7,
  useRouter = true,
}: {
  invoiceId: string;
  freelancerAddress: string;
  totalAmountUSDC: number;
  milestoneTitles: string[];
  milestoneAmountsUSDC: number[];
  disputeWindowDays?: number;
  useRouter?: boolean;
}): Promise<{ txHash: Hash; escrowAddress: string }> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  if (!wallet) throw new Error("No wallet connected.");

  const [account] = await wallet.getAddresses();
  if (!account) throw new Error("No account found.");
  if (!FACTORY_ADDRESS) throw new Error("Escrow factory address not configured.");

  const toUnits = (amount: number) => parseUnits(amount.toString(), 6);
  const totalUnits = toUnits(totalAmountUSDC);
  const milestoneUnits = milestoneAmountsUSDC.map(toUnits);
  const routerAddr = (useRouter && ROUTER_ADDRESS) ? ROUTER_ADDRESS : "0x0000000000000000000000000000000000000000" as `0x${string}`;

  // Step 1: Approve USDC spend
  const allowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [account, FACTORY_ADDRESS],
  });

  if (BigInt(allowance as bigint) < totalUnits) {
    const approveTx = await wallet.writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "approve",
      args: [FACTORY_ADDRESS, totalUnits],
      account,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
  }

  // Step 2: Create escrow via factory
  const createTx = await wallet.writeContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "createEscrow",
    args: [
      USDC_ADDRESS,
      freelancerAddress as `0x${string}`,
      routerAddr,
      totalUnits,
      BigInt(disputeWindowDays),
      invoiceId,
      milestoneTitles,
      milestoneUnits,
    ],
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });

  // Step 3: Read escrow address from factory
  const escrowAddress = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getEscrowByInvoice",
    args: [invoiceId],
  }) as string;

  return { txHash: createTx, escrowAddress };
}

/**
 * Fund an existing escrow (client deposits USDC).
 */
export async function fundEscrow(escrowAddress: string): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  if (!wallet) throw new Error("No wallet connected.");

  const [account] = await wallet.getAddresses();
  const addr = escrowAddress as `0x${string}`;

  // Get total amount to approve
  const totalAmount = await publicClient.readContract({
    address: addr,
    abi: ESCROW_ABI,
    functionName: "totalAmount",
  }) as bigint;

  // Approve USDC
  const approveTx = await wallet.writeContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "approve",
    args: [addr, totalAmount],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  // Fund
  const fundTx = await wallet.writeContract({
    address: addr,
    abi: ESCROW_ABI,
    functionName: "fund",
    args: [],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: fundTx });
  return fundTx;
}

/**
 * Approve a milestone release (client action).
 */
export async function approveMilestone(escrowAddress: string, milestoneIndex: number): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  if (!wallet) throw new Error("No wallet connected.");
  const [account] = await wallet.getAddresses();

  const tx = await wallet.writeContract({
    address: escrowAddress as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: "approveMilestone",
    args: [BigInt(milestoneIndex)],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: tx });
  return tx;
}

/**
 * Request a milestone release (freelancer action).
 */
export async function requestMilestoneRelease(escrowAddress: string, milestoneIndex: number): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  if (!wallet) throw new Error("No wallet connected.");
  const [account] = await wallet.getAddresses();

  const tx = await wallet.writeContract({
    address: escrowAddress as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: "requestRelease",
    args: [BigInt(milestoneIndex)],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: tx });
  return tx;
}

/**
 * Read escrow state from chain.
 */
export async function readEscrowState(escrowAddress: string) {
  const publicClient = getPublicClient();
  const addr = escrowAddress as `0x${string}`;

  const [funded, totalAmount, totalReleased, isFullyReleased, balance] = await Promise.all([
    publicClient.readContract({ address: addr, abi: ESCROW_ABI, functionName: "funded" }),
    publicClient.readContract({ address: addr, abi: ESCROW_ABI, functionName: "totalAmount" }),
    publicClient.readContract({ address: addr, abi: ESCROW_ABI, functionName: "totalReleased" }),
    publicClient.readContract({ address: addr, abi: ESCROW_ABI, functionName: "isFullyReleased" }),
    publicClient.readContract({ address: addr, abi: ESCROW_ABI, functionName: "getBalance" }),
  ]);

  return {
    funded: funded as boolean,
    totalAmount: totalAmount as bigint,
    totalReleased: totalReleased as bigint,
    isFullyReleased: isFullyReleased as boolean,
    balance: balance as bigint,
  };
}
