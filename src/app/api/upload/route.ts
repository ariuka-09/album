import { auth } from "@/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const key = `photos/${crypto.randomUUID()}`;
    const buffer = await file.arrayBuffer();

    await env.PHOTOS.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    });

    urls.push(`/api/photos/${key.replace("photos/", "")}`);
  }

  return NextResponse.json({ urls });
}
