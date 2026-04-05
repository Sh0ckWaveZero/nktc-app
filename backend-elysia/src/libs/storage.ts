import "dotenv/config";
import * as crypto from "crypto";
import { Client as MinioClient } from "minio";
import { logger } from "../infrastructure/logging/index.ts";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || process.env.STORAGE_BUCKET || process.env.MINIO_BUCKET || "nktc-uploads";

let storageClient: MinioClient | null = null;
let isConnected = false;

function getClient(): MinioClient {
  if (!storageClient) {
    const endpoint = process.env.MINIO_ENDPOINT || process.env.STORAGE_ENDPOINT || "localhost";
    const port = parseInt(process.env.MINIO_PORT || process.env.STORAGE_PORT || "9000");
    const useSSL = (process.env.MINIO_USE_SSL || process.env.STORAGE_USE_SSL) === "true";
    const accessKey = process.env.MINIO_ACCESS_KEY || process.env.STORAGE_ACCESS_KEY || "minioadmin";
    const secretKey = process.env.MINIO_SECRET_KEY || process.env.STORAGE_SECRET_KEY || "minioadmin";

    logger.info("📀 Initializing storage client", {
      endpoint,
      port,
      useSSL,
      bucket: BUCKET_NAME,
    });

    storageClient = new MinioClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }
  return storageClient;
}

export const storage = {
  get client() {
    return getClient();
  },
  bucket: BUCKET_NAME,

  async ensureBucket(): Promise<void> {
    const client = getClient();
    try {
      const exists = await client.bucketExists(BUCKET_NAME);
      if (!exists) {
        await client.makeBucket(BUCKET_NAME);
        logger.info(`Bucket "${BUCKET_NAME}" created`, { bucket: BUCKET_NAME });
      }
      isConnected = true;
      logger.info(`✅ Storage connected to bucket "${BUCKET_NAME}"`, {
        bucket: BUCKET_NAME,
        status: "connected",
      });
    } catch (error) {
      isConnected = false;
      logger.error("❌ Failed to ensure bucket", {
        bucket: BUCKET_NAME,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async uploadBase64(
    base64Data: string,
    folder: string = "images"
  ): Promise<string> {
    const buffer = Buffer.from(base64Data, "base64");
    const hash = crypto.createHash("md5").update(buffer).digest("hex");
    const filename = `${folder}/${hash}.webp`;

    await getClient().putObject(BUCKET_NAME, filename, buffer, buffer.length, {
      "Content-Type": "image/webp",
    });

    logger.debug("File uploaded", { filename, folder, size: buffer.length });

    return filename;
  },

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string = "application/octet-stream"
  ): Promise<string> {
    await getClient().putObject(BUCKET_NAME, filename, buffer, buffer.length, {
      "Content-Type": contentType,
    });

    logger.debug("Buffer uploaded", { filename, contentType, size: buffer.length });

    return filename;
  },

  async getFile(filename: string): Promise<Buffer> {
    logger.debug("Fetching file", { filename });
    const dataStream = await getClient().getObject(BUCKET_NAME, filename);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      dataStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      dataStream.on("end", () => {
        logger.debug("File fetched", { filename, size: Buffer.concat(chunks).length });
        resolve(Buffer.concat(chunks));
      });
      dataStream.on("error", (error) => {
        logger.error("Failed to fetch file", { filename, error: error.message });
        reject(error);
      });
    });
  },

  async deleteFile(filename: string): Promise<void> {
    await getClient().removeObject(BUCKET_NAME, filename);
    logger.debug("File deleted", { filename });
  },

  getFileUrl(filename: string): string {
    return `/statics/${filename}`;
  },

  async isAvailable(): Promise<boolean> {
    if (isConnected) return true;
    try {
      await this.ensureBucket();
      return true;
    } catch {
      return false;
    }
  },

  getStatus(): { connected: boolean; bucket: string } {
    return {
      connected: isConnected,
      bucket: BUCKET_NAME,
    };
  },
};

// Initialize on startup (non-blocking)
storage.ensureBucket().catch(() => {
  logger.warn("⚠️ Storage unavailable at startup - will retry on first use", {
    bucket: BUCKET_NAME,
  });
});