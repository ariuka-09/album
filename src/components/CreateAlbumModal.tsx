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

    const json = await res.json() as {
      errors?: { message: string }[];
      data: { createAlbum: { id: string; title: string } };
    };
    setLoading(false);

    if (json.errors) {
      setError(json.errors[0]?.message ?? "Failed to create album");
      return;
    }

    onCreated(json.data.createAlbum);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">New Album</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label className="modal-label">Title</label>
            <input
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Class of 2025"
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="modal-label">
              Description{" "}
              <span style={{ color: "var(--text-3)" }}>(optional)</span>
            </label>
            <textarea
              className="modal-input"
              style={{ resize: "none" }}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Our graduation memories…"
            />
          </div>
          {error && (
            <p style={{ color: "var(--sepia-300)", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
