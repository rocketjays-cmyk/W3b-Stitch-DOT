"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@/contracts/anchor.json"; // from your built ink! contract
import { useDid } from "@/components/DidProvider";

function useQueryParam(key: string) {
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    setValue(u.searchParams.get(key) || "");
  }, [key]);
  return value;
}

export default function VerifyPage() {
  const qrHash = useQueryParam("hash");
  const qrDid = useQueryParam("did");
  const { did } = useDid();
  const [status, setStatus] = useState<"idle" | "match" | "nomatch">("idle");
  const [owner, setOwner] = useState<string | null>(null);

  const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with deployed ink! contract

  useEffect(() => {
    if (!qrHash) return;

    async function verifyOnChain() {
      const wsProvider = new WsProvider("wss://rpc.shibuya.astar.network"); // or your chain
      const api = await ApiPromise.create({ provider: wsProvider });
      const contract = new ContractPromise(api, metadata, contractAddress);

      const { output } = await contract.query.verify(
        qrDid || qrHash, // caller address or dummy if needed
        { gasLimit: -1 },
        qrHash
      );

      const result = output?.toString();
      setOwner(result || null);
      if (result) {
        setStatus("match");
      } else {
        setStatus("nomatch");
      }
    }

    verifyOnChain();
  }, [qrHash, qrDid]);

  const badge = useMemo(() => {
    if (status === "match")
      return (
        <span className="px-2 py-1 rounded bg-green-100 border border-green-300">
          ✔ Verified
        </span>
      );
    if (status === "nomatch")
      return (
        <span className="px-2 py-1 rounded bg-red-100 border border-red-300">
          ✖ Not Verified
        </span>
      );
    return null;
  }, [status]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Verify Credential</h1>

      <div className="space-y-1">
        <p className="text-sm">Expected hash (from QR):</p>
        <p className="text-xs font-mono break-all">{qrHash || "(none in URL)"}</p>
        <p className="text-sm">DID: {qrDid || "(none)"}</p>
        {did && qrDid && did !== qrDid && (
          <p className="text-red-600 text-xs">Logged-in DID mismatch</p>
        )}
        {owner && (
          <p className="text-sm">
            On-chain owner: <span className="font-mono">{owner}</span>
          </p>
        )}
      </div>

      {badge}

      <p className="text-xs text-gray-600">
        Tip: The issuer can also publish chain tx/receipt alongside the QR for an audit trail.
      </p>
    </main>
  );
}
