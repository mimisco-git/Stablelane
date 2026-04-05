export type SocialProviderKey = "google" | "apple" | "twitter";
export type WalletProviderKey = "metamask" | "coinbase" | "injected";

export type SocialProviderOption = {
  key: SocialProviderKey;
  label: "Google" | "Apple" | "X";
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
    {
      key: "apple",
      label: "Apple",
      enabled: envEnabled(process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED),
    },
    {
      key: "twitter",
      label: "X",
      enabled: envEnabled(process.env.NEXT_PUBLIC_AUTH_X_ENABLED),
    },
  ];
}

function detectWalletProviders() {
  if (typeof window === "undefined") {
    return { hasMetaMask: false, hasCoinbase: false, hasInjected: false };
  }

  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!ethereum) {
    return { hasMetaMask: false, hasCoinbase: false, hasInjected: false };
  }

  const providers = Array.isArray(ethereum.providers) && ethereum.providers.length
    ? ethereum.providers
    : [ethereum];

  const hasMetaMask = providers.some((provider) => Boolean(provider?.isMetaMask));
  const hasCoinbase = providers.some((provider) => Boolean(provider?.isCoinbaseWallet));
  const hasInjected = providers.length > 0;

  return { hasMetaMask, hasCoinbase, hasInjected };
}

export function getWalletProviderOptions(): WalletProviderOption[] {
  const detected = detectWalletProviders();
  const options: WalletProviderOption[] = [];

  if (detected.hasMetaMask) {
    options.push({ key: "metamask", label: "MetaMask", available: true });
  }
  if (detected.hasCoinbase) {
    options.push({ key: "coinbase", label: "Coinbase Wallet", available: true });
  }
  if (!detected.hasMetaMask && !detected.hasCoinbase && detected.hasInjected) {
    options.push({ key: "injected", label: "Browser Wallet", available: true });
  }

  return options;
}
