"use client";

import { Music, Cloud } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const providers = [
    { id: "google", name: "Google Drive", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "dropbox", name: "Dropbox", color: "bg-blue-600 hover:bg-blue-700" },
    { id: "azure-ad", name: "OneDrive", color: "bg-sky-500 hover:bg-sky-600" },
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8 p-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Music size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">CloudBeats</h1>
          <p className="text-sm text-on-surface-variant">
            Stream your music from the cloud
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => signIn(p.id, { callbackUrl: "/library" })}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm transition-colors cursor-pointer ${p.color}`}
            >
              <Cloud size={18} />
              Sign in with {p.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-on-surface-variant text-center">
          Your files are read-only. We never modify or delete your data.
        </p>
      </div>
    </div>
  );
}
