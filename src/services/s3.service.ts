import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { AppError } from "../utils/AppError";
import { ENV } from "../config/env";
import { s3 } from "../config/s3";

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = ENV.AWS_S3_BUCKET_NAME;
  }

  async getPublicUrl(key: string) {
    return `https://${this.bucketName}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads") {
    if (!file) throw new AppError("No file provided", 400);

    const key = `${folder}/${Date.now()}-${file.originalname}`;
    const bodyStream = fs.createReadStream(file.path);

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: bodyStream,
      ContentType: file.mimetype,
    };

    const upload = new Upload({
      client: s3,
      params,
      queueSize: 4,
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    upload.on("httpUploadProgress", (progress) => {
      if (progress.total) {
        const percent = Math.round((progress.loaded! / progress.total) * 100);
        process.stdout.write(`\rUploading: ${percent}%`);
      }
    });

    await upload.done();
    console.log("\nUpload completed successfully!");

    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    return key;
  }

  async uploadFiles(files: Express.Multer.File[], folder = "uploads") {
    if (!files || files.length === 0)
      throw new AppError("No files provided", 400);

    const urls = await Promise.all(
      files.map((file) => this.uploadFile(file, folder))
    );

    return urls;
  }

  async generatePresignedUrl(
    folder: string,
    fileName: string,
    mimeType: string
  ) {
    const key = `${folder}/presigned-${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });

    const fileUrl = this.getPublicUrl(key);

    return { uploadUrl, fileUrl };
  }

  async getAsset({ key }: { key: string }) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await s3.send(command);
  }

  async getSignedUrl(
    key: string,
    options?: { download?: boolean; name?: string }
  ) {
    const { download = false, name } = options || {};

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: download
        ? `attachment; filename="${name || key.split("/").pop() || "file"}"`
        : undefined,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
  }

  async deleteFile(key: string) {
    if (!key) throw new AppError("File key is required", 400);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await s3.send(command);
      console.log(`Deleted file: ${key}`);
      return true;
    } catch (err: any) {
      console.error("S3 delete error:", err);
      throw new AppError("Failed to delete file from S3", 500);
    }
  }

  async deleteFiles(keys: string[]): Promise<DeleteObjectsCommandOutput> {
    if (!keys || keys.length === 0) {
      throw new AppError("No file keys provided", 400);
    }

    const objects = keys.map((key) => ({ Key: key }));

    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: objects,
        Quiet: keys.length > 50,
      },
    });

    const result = (await s3.send(command)) as DeleteObjectsCommandOutput;

    const deletedCount = result.Deleted?.length || 0;
    const errorCount = result.Errors?.length || 0;

    console.log(
      `Deleted ${deletedCount} file(s) from S3${
        errorCount ? ` (${errorCount} failed)` : ""
      }`
    );

    if (errorCount > 0) {
      console.warn("Some files failed to delete:", result.Errors);
    }

    return result;
  }
}
