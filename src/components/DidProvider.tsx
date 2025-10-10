"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  OnboardProvider,
  useConnectWallet,
  useWallets,
} from "@polkadot-onboard/react";
import {
  WalletConnectProvider,
  PolkadotExtensionProvider,
} from "@polkadot-onboard/core";

// --- CONFIGURATION --- //
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
const RELAY_URL = "wss://relay.walletconnect.com";

// --- DID CONTEXT --- //
type DidContextValue = {
  did: string | null;
  setDid: (did: string | null) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  account: string | null;
  connected: boolean;
};

const DidContext = createContext<DidContextValue | undefined>(undefined);

export function DidProvider({ children }: { children: ReactNode }) {
  const [did, setDid] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("did") : null
  );
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // --- Universal Wallet Providers (Mobile + Desktop) --- //
  const providers = [
    new WalletConnectProvider({
      projectId: WALLETCONNECT_PROJECT_ID,
      relayUrl: RELAY_URL,
    }),
    new PolkadotExtensionProvider(), // SubWallet, Talisman, Polkadot.js
  ];

  const onboard = new OnboardProvider({ wallets: providers });

  // --- Wallet Connection --- //
  const connectWallet = async () => {
    try {
      const wallet = await onboard.connect();
      if (wallet?.accounts?.length) {
        const userAccount = wallet.accounts[0].address;
        setAccount(userAccount);
        setConnected(true);

        // TEMP: Treat wallet address as pseudo-DID until your chain supports native DIDs
        setDid(`did:w3bstitch:${userAccount}`);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    onboard.disconnect();
    setAccount(null);
    setConnected(false);
    setDid(null);
    sessionStorage.removeItem("did");
  };

  // --- Persist DID --- //
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (did) sessionStorage.setItem("did", did);
    else sessionStorage.removeItem("did");
  }, [did]);

  return (
    <DidContext.Provider
      value={{ did, setDid, connectWallet, disconnectWallet, account, connected }}
    >
      {children}
    </DidContext.Provider>
  );
}

export function useDid() {
  const ctx = useContext(DidContext);
  if (!ctx) throw new Error("useDid must be used within DidProvider");
  return ctx;
}
