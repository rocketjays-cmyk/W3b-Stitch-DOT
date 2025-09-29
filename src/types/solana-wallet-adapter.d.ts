declare module '@solana/wallet-adapter-react' {
  import type { FC, ReactNode } from 'react';
  export const ConnectionProvider: FC<{
    endpoint: string;
    children: ReactNode;
    config?: { commitment?: string };
  }>;
  export const WalletProvider: FC<{
    wallets: any[];
    children: ReactNode;
    autoConnect?: boolean;
  }>;
}

declare module '@solana/wallet-adapter-react-ui' {
  import type { FC, ReactNode } from 'react';
  export const WalletModalProvider: FC<{ children: ReactNode }>;
}

declare module '@solana/wallet-adapter-react-ui/styles.css';

declare module '@solana/wallet-adapter-solflare' {
  export class SolflareWalletAdapter {
    constructor(config?: any);
  }
}
