import ChainIndicator from "../components/ChainIndicator";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <ChainIndicator />
      </div>
      <div className="text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
          W3b Stitch- Trust Engine
        </h1>

        <p className="mb-10 text-lg text-gray-300 max-w-2xl mx-auto">
          A decentralized trust engine for verifying media, credentials, and
          identities. Built on <span className="font-semibold">Polkadot</span>{" "}
          for security and interoperability.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/login"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            🔐 Chain Picker Login
          </a>
          <a
            href="/verify"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            ✅ Try Verification
          </a>
          <a
            href="/credential"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition"
          >
            🎓 Credential → QR
          </a>
        </div>

        <footer className="mt-16 text-gray-500 text-sm">
          © {new Date().getFullYear()} W3b Stitch Technologies LLC
        </footer>
      </div>
    </main>
  );
}
