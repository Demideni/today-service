import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function s3() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

export async function presignUpload(key: string, contentType: string) {
  const Bucket = process.env.S3_BUCKET!;
  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3(), command, { expiresIn: 60 });
  const publicBase = process.env.S3_PUBLIC_BASE_URL!;
  const publicUrl = `${publicBase}/${key}`;
  return { url, publicUrl };
}
