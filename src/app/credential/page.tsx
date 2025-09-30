"use client";

import React, { useState } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@/contracts/anchor.json"; // from your built ink! contract
import { useDid } from "@/components/DidProvider";
import QRCode from "qrcode";

export default function CredentialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState("");
  const { did } = useDid();

  const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with deployed ink! contract
  const wsEndpoint = "wss://rpc.shibuya.astar.network"; // or your chain

  async function fileToSha256Hex(file: File) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setQr("");
    setHash("");
    const f = e.target.files?.[0] ?? null;
    setFile(f || null);
    if (!f) return;
    const h = await fileToSha256Hex(f);
    setHash(h);
  }

  async function onAnchor() {
    if (!file || !hash) return;
    if (!did) {
      setError("Login required");
      return;
    }

    setLoading(true);
    setStatus("Connecting to chain…");
    setError("");

    try {
      const wsProvider = new WsProvider(wsEndpoint);
      const api = await ApiPromise.create({ provider: wsProvider });
      const contract = new ContractPromise(api, metadata, contractAddress);

      setStatus("Anchoring hash on-chain…");

      // Note: For Tx signing, you need an injector from Polkadot extension
      const { web3Enable, web3Accounts, web3FromAddress } = await import(
        "@polkadot/extension-dapp"
      );
      await web3Enable("W3b Stitch");
      const parts = did.split(":");
      const didAddress = parts[3];
      const accounts = await web3Accounts();
      const account = accounts.find((a) => a.address === didAddress);
      if (!account) throw new Error("Wallet does not match logged-in DID");
      const injector = await web3FromAddress(didAddress);

      const tx = contract.tx.anchor({ gasLimit: -1 }, hash);

      setStatus("Awaiting wallet confirmation…");

      await new Promise<void>(async (resolve, reject) => {
        const unsub = await tx.signAndSend(
          didAddress,
          { signer: injector.signer, nonce: -1 },
          ({ status, dispatchError, txHash }) => {
            if (dispatchError) {
              unsub();
              reject(new Error(dispatchError.toString()));
              return;
            }

            if (status.isInBlock) {
              setStatus("Included in block");

              const verifyUrl = `${window.location.origin}/verify?did=${encodeURIComponent(
                did
              )}&hash=${encodeURIComponent(hash)}`;

              QRCode.toDataURL(verifyUrl, { margin: 1, width: 280 }).then(setQr);
            }

            if (status.isFinalized) {
              setStatus("Finalized");
              unsub();
              resolve();
            }
          }
        );
      });

      await api.disconnect();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Credential → QR Verification</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Upload credential (PDF/Image)
        </label>
        <input type="file" onChange={onSelect} className="block w-full" />
        {hash && (
          <p className="text-xs break-all">
            SHA-256: <span className="font-mono">{hash}</span>
          </p>
        )}
      </div>

      <button
        onClick={onAnchor}
        disabled={!file || !hash || loading}
        className="rounded-xl px-4 py-2 shadow border text-sm disabled:opacity-50"
      >
        {loading ? "Anchoring…" : "Anchor + Generate QR"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status && !error && <p className="text-sm">{status}</p>}

      {qr && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">QR Code (scan to verify)</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="Verification QR"
            className="border rounded-xl p-2"
          />
          <p className="text-sm">
            Or open:{" "}
            <a
              className="underline"
              href={`/verify?did=${encodeURIComponent(did ?? "")}&hash=${encodeURIComponent(
                hash
              )}`}
            >
              /verify?hash=…
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
