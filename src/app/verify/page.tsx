"use client";

import React, { useMemo, useState } from "react";
import { fileToSha256Hex } from "../../../lib/hash";
import { useDid } from "@/components/DidProvider";

function useQueryParam(key: string) {
  const [value, setValue] = useState<string>("");
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const v = u.searchParams.get(key) || "";
    setValue(v);
  }, [key]);
  return value;
}

export default function VerifyPage() {
  const qrHash = useQueryParam("hash");
  const qrDid = useQueryParam("did");
  const { did } = useDid();
  const [calcHash, setCalcHash] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "match" | "nomatch">("idle");

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setCalcHash("");
    setStatus("idle");
    if (!f) return;
    const h = await fileToSha256Hex(f);
    setCalcHash(h);
    if (qrHash) {
      setStatus(h.toLowerCase() === qrHash.toLowerCase() ? "match" : "nomatch");
    }
  }

  const badge = useMemo(() => {
    if (status === "match")
      return (
        <span className="px-2 py-1 rounded bg-green-100 border border-green-300">
          ? Verified
        </span>
      );
    if (status === "nomatch")
      return (
        <span className="px-2 py-1 rounded bg-red-100 border border-red-300">
          ? Not Verified
        </span>
      );
    return null;
  }, [status]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Verify Credential</h1>

      <div className="space-y-1">
        <p className="text-sm">Expected hash (from QR):</p>
        <p className="text-xs font-mono break-all">
          {qrHash || "(none in URL)"}
        </p>
        <p className="text-sm">DID: {qrDid || "(none)"}</p>
        {did && qrDid && did !== qrDid && (
          <p className="text-red-600 text-xs">Logged-in DID mismatch</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Upload the credential to verify
        </label>
        <input type="file" onChange={onSelect} className="block w-full" />
        {calcHash && (
          <p className="text-xs break-all">
            Calc SHA-256: <span className="font-mono">{calcHash}</span>
          </p>
        )}
      </div>

      {badge}

      <p className="text-xs text-gray-600">
        Tip: The issuer can also publish chain tx/receipt alongside the QR for
        an audit trail.
      </p>
    </main>
  );
}
