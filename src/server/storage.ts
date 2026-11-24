import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { requireEnv } from "@/server/env";

let client: S3Client | undefined;

function s3(): S3Client {
  if (!client) {
    client = new S3Client({ region: process.env.AWS_REGION ?? "af-south-1" });
  }
  return client;
}

/** Uploads a public marketing image (doctor photo) and returns its local URL. */
export async function putPublicImage(
  file: File,
  prefix = "doctor-photos",
): Promise<string> {
  const rawExt = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const ext = rawExt.replace(/[^a-z0-9]/g, "") || "jpg";
  const key = `${prefix}/${randomUUID()}.${ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: requireEnv("S3_BUCKET"),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `/media/${key}`;
}

export async function getObject(
  key: string,
): Promise<{ body: Uint8Array | null; contentType: string }> {
  const result = await s3().send(
    new GetObjectCommand({ Bucket: requireEnv("S3_BUCKET"), Key: key }),
  );
  return {
    body: result.Body ? await result.Body.transformToByteArray() : null,
    contentType: result.ContentType ?? "application/octet-stream",
  };
}
