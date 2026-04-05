"use client";

import { useEffect, useMemo, useState } from "react";
import { EnvironmentName, getNetworkConfig } from "@/lib/networks";

const STORAGE_KEY = "stablelane_environment_v1";

export function useAppEnvironment() {
  const [environment, setEnvironmentState] = useState<EnvironmentName>("testnet");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "mainnet" || stored === "testnet") {
        setEnvironmentState(stored);
      }
    } finally {
      setReady(true);
    }
  }, []);

  function setEnvironment(next: EnvironmentName) {
    setEnvironmentState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }

  const network = useMemo(() => getNetworkConfig(environment), [environment]);

  return {
    ready,
    environment,
    setEnvironment,
    network,
  };
}
