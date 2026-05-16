"use client";

import { useRef, useState } from "react";

type Props = {
  albumId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function CreatePostModal({ albumId, onClose, onCreated }: Props) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Add at least one photo");
      return;
    }
    setLoading(true);
    setError(null);

    // 1. Upload photos
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    const uploadJson = await uploadRes.json() as { urls?: string[]; error?: string };

    if (!uploadRes.ok || !uploadJson.urls) {
      setError(uploadJson.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    // 2. Create post via GraphQL
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation CreatePost($albumId: String!, $description: String, $photoUrls: [String!]!) {
            createPost(albumId: $albumId, description: $description, photoUrls: $photoUrls) {
              id
            }
          }
        `,
        variables: {
          albumId,
          description: description.trim() || null,
          photoUrls: uploadJson.urls,
        },
      }),
    });

    const json = await res.json() as { errors?: { message: string }[] };
    setLoading(false);

    if (json.errors) {
      setError(json.errors[0]?.message ?? "Failed to create post");
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">New Post</h2>
        <form onSubmit={submit}>
          {/* Photo picker drop zone */}
          <div
            className="drop-zone"
            onClick={() => inputRef.current?.click()}
            style={{ marginBottom: 16 }}
          >
            {previews.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{ height: 80, width: 80, objectFit: "cover", borderRadius: "var(--radius)" }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--text-3)", marginBottom: 8 }}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                  Click to select photos
                </p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={onFileChange}
          />

          <div style={{ marginBottom: 16 }}>
            <label className="modal-label">
              Caption{" "}
              <span style={{ color: "var(--text-3)" }}>(optional)</span>
            </label>
            <textarea
              className="modal-input"
              style={{ resize: "none" }}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Say something about this moment…"
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
              disabled={loading || files.length === 0}
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
