"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onCreated: (album: { id: string; title: string }) => void;
};

export function CreateAlbumModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation CreateAlbum($title: String!, $description: String) {
            createAlbum(title: $title, description: $description) {
              id title
            }
          }
        `,
        variables: { title: title.trim(), description: description.trim() || null },
      }),
    });

    const json = await res.json() as { errors?: { message: string }[]; data: { createAlbum: { id: string; title: string } } };
    setLoading(false);

    if (json.errors) {
      setError(json.errors[0]?.message ?? "Failed to create album");
      return;
    }

    onCreated(json.data.createAlbum);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-white font-semibold text-lg mb-4">New Album</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Title</label>
            <input
              className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Class of 2025"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">
              Description
              <span className="text-zinc-600 ml-1">(optional)</span>
            </label>
            <textarea
              className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20 resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Our graduation memories..."
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-white hover:bg-zinc-100 text-black rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
