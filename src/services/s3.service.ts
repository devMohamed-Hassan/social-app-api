import { createReadStream, statSync } from "fs";
import { AppError } from "../utils/AppError";
import { ENV } from "../config/env";
import { s3 } from "../config/s3";
import { StoreIn } from "./multer/multer.config";
import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export class S3Service {
  private static readonly bucketName = ENV.AWS_S3_BUCKET_NAME;
  private static readonly region = ENV.AWS_REGION;
  private static readonly ACL = "private";

  static getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  static async upload({
    path = "general",
    file,
    storeIn,
  }: {
    path?: string;
    file: Express.Multer.File;
    storeIn: StoreIn;
  }): Promise<string> {
    if (!file) throw new AppError("No file provided for upload", 400);

    const key = `socialapp/${path}/${Date.now()}-${randomUUID()}-${
      file.originalname
    }`;
    const isLarge = this.isLargeFile(file, storeIn);
    const fileBody =
      storeIn === StoreIn.MEMORY ? file.buffer : createReadStream(file.path);

    if (isLarge) {
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBody,
          ContentType: file.mimetype,
          ACL: this.ACL,
        },
        partSize: 10 * 1024 * 1024,
        queueSize: 6,
        leavePartsOnError: false,
      });

      upload.on("httpUploadProgress", (progress) => {
        console.log(
          `Uploading ${file.originalname}: ${(
            ((progress.loaded || 0) / (progress.total || 1)) *
            100
          ).toFixed(1)}%`
        );
      });

      await upload.done();
    } else {
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBody,
          ContentType: file.mimetype,
          ACL: this.ACL,
        })
      );
    }

    return this.getFileUrl(key);
  }

  private static isLargeFile(
    file: Express.Multer.File,
    storeIn: StoreIn
  ): boolean {
    if (storeIn === StoreIn.MEMORY) return file.size > 5 * 1024 * 1024;
    try {
      const stats = statSync(file.path);
      return stats.size > 10 * 1024 * 1024;
    } catch {
      return false;
    }
  }
}
