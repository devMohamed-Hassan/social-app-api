import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
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

    const fileUrl = `https://${this.bucketName}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
    return fileUrl;
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

    const fileUrl = `https://${this.bucketName}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
  }
}
