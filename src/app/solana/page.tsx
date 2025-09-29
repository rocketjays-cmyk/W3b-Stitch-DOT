"use client";

import { useEffect, useState } from "react";

export default function SolanaPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("solanaAddress");
    if (saved) setAddress(saved);
  }, []);

  interface SolflareWallet {
    isSolflare?: boolean;
    connect: () => Promise<{ publicKey: { toString(): string } } | void>;
    disconnect?: () => Promise<void> | void;
    publicKey?: { toString(): string };
  }

  interface SolflareWindow extends Window {
    solflare?: SolflareWallet;
    solana?: SolflareWallet;
  }

  async function connect() {
    try {
      setError("");
      const provider =
        (window as SolflareWindow).solflare ??
        (window as SolflareWindow).solana;
      if (!provider) {
        setError("No Solflare wallet found.");
        return;
      }
      if (!provider.publicKey) {
        await provider.connect();
      }
      const pubkey = provider.publicKey?.toString();
      if (pubkey) {
        setAddress(pubkey);
        localStorage.setItem("solanaAddress", pubkey);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  }

  function logout() {
    const provider =
      (window as SolflareWindow).solflare ?? (window as SolflareWindow).solana;
    try {
      provider?.disconnect?.();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("solanaAddress");
    setAddress(null);
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Solana Connectivity</h1>
      {address ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Connected: {address.slice(0, 4)}…{address.slice(-4)}
          </span>
          <button
            onClick={logout}
            className="rounded-xl px-4 py-2 shadow border text-sm"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="rounded-xl px-4 py-2 shadow border text-sm"
        >
          Connect Solflare
        </button>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </main>
  );
}
