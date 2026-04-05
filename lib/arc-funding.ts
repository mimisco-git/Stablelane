export type FundingLaneKey = "wallet" | "gateway" | "crosschain";

export const fundingLaneStorageKey = "stablelane_arc_funding_lane_v1";

export const arcFundingLanes = [
  {
    key: "wallet" as FundingLaneKey,
    title: "Wallet-funded settlement",
    status: "Active now",
    detail:
      "Fund invoices directly from a connected Arc testnet wallet and keep the funding hash tied to the escrow history.",
  },
  {
    key: "gateway" as FundingLaneKey,
    title: "Gateway deposit lane",
    status: "Ready for next step",
    detail:
      "Prepare a dedicated deposit lane for chain-abstracted USDC movement into Stablelane settlement balances.",
  },
  {
    key: "crosschain" as FundingLaneKey,
    title: "Crosschain USDC lane",
    status: "Design stage",
    detail:
      "Keep a structured lane ready for future CCTP-style USDC movement into Arc testnet escrow and payout flows.",
  },
];

export const arcFundingEnv = {
  gatewayAddress: process.env.NEXT_PUBLIC_ARC_TESTNET_GATEWAY_ADDRESS || "",
  cctpTokenMessenger: process.env.NEXT_PUBLIC_ARC_TESTNET_CCTP_TOKEN_MESSENGER || "",
  cctpMessageTransmitter: process.env.NEXT_PUBLIC_ARC_TESTNET_CCTP_MESSAGE_TRANSMITTER || "",
};
