"use client";

import { useDid } from "./DidProvider";

function networkFromDid(did: string): string {
  const parts = did.split(":");
  if (parts[1] === "solana") {
    return "solana";
  }
  return parts[2] || "";
}

export default function ChainIndicator() {
  const { did } = useDid();
  if (!did) {
    return <span className="text-sm text-red-500">Not logged in</span>;
  }

  const network = networkFromDid(did);
  return <span className="text-sm">Connected: {network}</span>;
}
