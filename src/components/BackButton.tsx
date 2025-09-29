"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 left-4 px-3 py-1 border rounded"
    >
      ← Back
    </button>
  );
}
