'use client';

import { useEffect, useMemo } from 'react';
// eslint-disable-next-line import/no-unresolved
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// eslint-disable-next-line import/no-unresolved
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

interface Props {
  children: React.ReactNode;
}

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? 'https://api.devnet.solana.com';

export function SolanaWalletProvider({ children }: Props) {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth'
          }),
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        if (res.status === 403) {
          console.error(
            `RPC endpoint ${endpoint} returned 403. Check CORS settings or verify the endpoint.`
          );
        }
      } catch (err) {
        console.error('Failed to reach RPC endpoint', err);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

