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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-white font-semibold text-lg mb-4">New Post</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Photo picker */}
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-zinc-500 transition-colors min-h-[120px] flex items-center justify-center"
          >
            {previews.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center">
                Click to select photos
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">
              Caption
              <span className="text-zinc-600 ml-1">(optional)</span>
            </label>
            <textarea
              className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20 resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Say something about this moment…"
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
              disabled={loading || files.length === 0}
              className="flex-1 bg-white hover:bg-zinc-100 text-black rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
