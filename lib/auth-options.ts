export type SocialProviderKey = "google";
export type WalletProviderKey = "metamask" | "coinbase" | "rabby" | "okx" | "trust" | "rainbow" | "injected";

export type SocialProviderOption = {
  key: SocialProviderKey;
  label: "Google";
  enabled: boolean;
};

export type WalletProviderOption = {
  key: WalletProviderKey;
  label: string;
  available: boolean;
};

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: EthereumProvider[];
};

function envEnabled(value: string | undefined) {
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function getSocialProviderOptions(): SocialProviderOption[] {
  return [
    {
      key: "google",
      label: "Google",
      enabled: envEnabled(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED),
    },
  ];
}

type ExtendedProvider = EthereumProvider & {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isRainbow?: boolean;
};

function detectWalletProviders() {
  if (typeof window === "undefined") {
    return { hasMetaMask: false, hasCoinbase: false, hasRabby: false, hasOkx: false, hasTrust: false, hasRainbow: false, hasInjected: false };
  }

  const win = window as Window & {
    ethereum?: ExtendedProvider;
    okxwallet?: ExtendedProvider;
    trustwallet?: ExtendedProvider;
  };

  const ethereum = win.ethereum;

  if (!ethereum && !win.okxwallet && !win.trustwallet) {
    return { hasMetaMask: false, hasCoinbase: false, hasRabby: false, hasOkx: false, hasTrust: false, hasRainbow: false, hasInjected: false };
  }

  const providers: ExtendedProvider[] = ethereum
    ? (Array.isArray((ethereum as any).providers) && (ethereum as any).providers.length
        ? (ethereum as any).providers
        : [ethereum])
    : [];

  if (win.okxwallet) providers.push(win.okxwallet);
  if (win.trustwallet) providers.push(win.trustwallet);

  const hasMetaMask = providers.some((p) => Boolean(p?.isMetaMask) && !p?.isRabby);
  const hasCoinbase = providers.some((p) => Boolean(p?.isCoinbaseWallet));
  const hasRabby = providers.some((p) => Boolean(p?.isRabby));
  const hasOkx = providers.some((p) => Boolean(p?.isOkxWallet)) || Boolean(win.okxwallet);
  const hasTrust = providers.some((p) => Boolean(p?.isTrust) || Boolean(p?.isTrustWallet)) || Boolean(win.trustwallet);
  const hasRainbow = providers.some((p) => Boolean(p?.isRainbow));
  const hasInjected = providers.length > 0;

  return { hasMetaMask, hasCoinbase, hasRabby, hasOkx, hasTrust, hasRainbow, hasInjected };
}

export function getWalletProviderOptions(): WalletProviderOption[] {
  const detected = detectWalletProviders();
  const options: WalletProviderOption[] = [];

  if (detected.hasMetaMask) options.push({ key: "metamask", label: "MetaMask", available: true });
  if (detected.hasCoinbase) options.push({ key: "coinbase", label: "Coinbase Wallet", available: true });
  if (detected.hasRabby) options.push({ key: "rabby", label: "Rabby Wallet", available: true });
  if (detected.hasOkx) options.push({ key: "okx", label: "OKX Wallet", available: true });
  if (detected.hasTrust) options.push({ key: "trust", label: "Trust Wallet", available: true });
  if (detected.hasRainbow) options.push({ key: "rainbow", label: "Rainbow", available: true });

  if (options.length === 0 && detected.hasInjected) {
    options.push({ key: "injected", label: "Browser Wallet", available: true });
  }

  return options;
}
