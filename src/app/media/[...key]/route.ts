import { NextResponse } from "next/server";
import { getObject } from "@/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serves public marketing images from the private S3 bucket. */
export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } },
) {
  const key = params.key.join("/");
  if (!key.startsWith("doctor-photos/") || key.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const object = await getObject(key);
    if (!object.body) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(Buffer.from(object.body), {
      headers: {
        "content-type": object.contentType,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
