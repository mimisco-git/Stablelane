export const arcTestnetFinance = {
  networkName: "Arc Testnet",
  chainId: 5042002,
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  faucetUrl: "https://faucet.circle.com",
  gasToken: {
    symbol: "USDC",
    kind: "Native gas token",
    decimals: 18,
    note: "Use USDC-denominated fee display for all transaction and settlement UI.",
  },
  stablecoins: [
    {
      symbol: "USDC",
      label: "Native USDC",
      address: "Native balance",
      decimals: 18,
      note: "Use for gas-aware wallet balance display on Arc.",
    },
    {
      symbol: "USDC",
      label: "USDC ERC-20 interface",
      address: "0x3600000000000000000000000000000000000000",
      decimals: 6,
      note: "Recommended standard ERC-20 interface for reading balances and transfers.",
    },
    {
      symbol: "EURC",
      label: "EURC token",
      address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
      decimals: 6,
      note: "Euro-denominated stablecoin supported on Arc Testnet.",
    },
  ],
  finality: {
    headline: "Final in under one second",
    detail: "Arc finality is deterministic, so a transaction is either pending or final.",
  },
  feePolicy: {
    baseFeeFloor: "160 Gwei",
    note: "Best practice is to surface gas fees in USDC and fetch the live base fee when submitting transactions.",
  },
};

export const arcSettlementLanes = [
  {
    title: "Wallet-funded escrow",
    status: "Active now",
    detail: "Fund invoices directly from a connected Arc testnet wallet and keep the settlement history attached to the invoice.",
  },
  {
    title: "Gateway funding lane",
    status: "Next build",
    detail: "Prepare a dedicated deposit lane for chain-abstracted USDC movement into Stablelane settlement flows.",
  },
  {
    title: "Crosschain funding lane",
    status: "Planned",
    detail: "Open a structured route for CCTP-style USDC movement into Arc testnet settlement operations.",
  },
];
