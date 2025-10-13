import { DeleteObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3 } from "../config/s3";
import { ENV } from "../config/env";
import fs from "fs";
import { AppError } from "../utils/AppError";

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = ENV.AWS_S3_BUCKET_NAME;
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads") {
    if (!file) throw new Error("No file provided");

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
      if (err) {
        console.error("Failed to delete temp file:", err);
      }
    });

    const fileUrl = `https://${this.bucketName}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
    return fileUrl;
  }

  async uploadFiles(files: Express.Multer.File[], folder = "uploads") {
    if (!files || files.length === 0) {
      throw new AppError("No files provided", 400);
    }

    const uploadPromises = files.map(async (file) => {
      const fileUrl = await this.uploadFile(file, folder);

      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete temp file: ${file.path}`, err);
        }
      });

      return fileUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  }
}
401;
