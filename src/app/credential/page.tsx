"use client";

import React, { useState } from "react";
import { useDid } from "@/components/DidProvider";
import QRCode from "qrcode";

// Relative import for the placeholder contract JSON
import metadata from "../contracts/anchor.json";

export default function CredentialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState("");
  const { did } = useDid();

  // Simple SHA-256 hash of file
  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setQr("");
    setHash("");
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (!f) return;

    const arrayBuffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    setHash(hashHex);
  }

  async function onAnchor() {
    if (!file || !hash) return;
    if (!did) {
      setError("Login required");
      return;
    }

    setLoading(true);
    setStatus("Simulating anchor...");

    try {
      // For now, just generate a QR code (placeholder, not real chain tx)
      const verifyUrl = `${window.location.origin}/verify?did=${encodeURIComponent(did)}&hash=${encodeURIComponent(hash)}`;
      const png = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 280 });
      setQr(png);

      setStatus("QR generated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Credential → QR Verification</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Upload credential (PDF/Image)</label>
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
        {loading ? "Generating…" : "Generate QR"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status && !error && <p className="text-sm">{status}</p>}

      {qr && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">QR Code (scan to verify)</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Verification QR" className="border rounded-xl p-2" />
          <p className="text-sm">
            Or open:{" "}
            <a
              className="underline"
              href={`/verify?did=${encodeURIComponent(did ?? "")}&hash=${encodeURIComponent(hash)}`}
            >
              /verify?hash=…
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
