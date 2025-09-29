"use client";

import { useMemo } from "react";
// eslint-disable-next-line import/no-unresolved
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
// eslint-disable-next-line import/no-unresolved
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// eslint-disable-next-line import/no-unresolved
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import {
  SOLANA_RPC_ENDPOINT,
  SOLANA_COMMITMENT,
} from "config/solana";

// eslint-disable-next-line import/no-unresolved
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={SOLANA_RPC_ENDPOINT}
      config={{ commitment: SOLANA_COMMITMENT }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
