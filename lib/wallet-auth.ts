export function buildWalletAuthMessage(input: {
  address: string;
  nonce: string;
  domain: string;
  uri: string;
  chainId: number;
  issuedAt: string;
}) {
  return [
    `${input.domain} wants you to verify your wallet for Stablelane.`,
    "",
    "This signature proves wallet ownership for workspace access.",
    "",
    `Address: ${input.address}`,
    `URI: ${input.uri}`,
    `Version: 1`,
    `Chain ID: ${input.chainId}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${input.issuedAt}`,
  ].join("\n");
}
