"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteManager({ invites }: { invites: string[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });

    const json = await res.json() as { error?: string };
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    setEmail("");
    router.refresh();
  }

  async function remove(target: string) {
    await fetch("/api/admin/invites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: target }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={add} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="classmate@gmail.com"
          className="flex-1 bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {invites.length === 0 ? (
        <p className="text-zinc-500 text-sm">No invites yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {invites.map((inv) => (
            <li key={inv} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2">
              <span className="text-zinc-200 text-sm">{inv}</span>
              <button
                onClick={() => remove(inv)}
                className="text-red-400 hover:text-red-300 text-xs transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
