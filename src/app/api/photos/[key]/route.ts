import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  console.log("[photos] request url:", request.url);
  const { key } = await params;
  const { env } = await getCloudflareContext({ async: true });

  const object = await env.PHOTOS.get(`photos/${key}`);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const download = url.searchParams.get("download");

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "image/jpeg");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (download) {
    // Force browser download with the supplied (or key-based) filename
    const filename = download === "1" ? key : download;
    // RFC 5987 — encode any non-ASCII chars safely
    const safe = encodeURIComponent(filename).replace(/['()]/g, escape);
    headers.set("Content-Disposition", `attachment; filename="${filename}"; filename*=UTF-8''${safe}`);
  }

  return new Response(object.body, { headers });
}
