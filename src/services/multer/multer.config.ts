import multer, { diskStorage, memoryStorage, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../../utils/AppError";

export enum StoreIn {
  DISK = "disk",
  MEMORY = "memory",
}

export const fileTypes = {
  images: ["image/jpeg", "image/png", "image/gif"],
};

const FILE_SIZE_THRESHOLD = 1 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const uploadPath = path.join(__dirname, "../../../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

export const uploadFile = ({
  storeIn = StoreIn.MEMORY,
  type = fileTypes.images,
}: {
  storeIn?: StoreIn;
  type?: string[];
}) => {
  const storage =
    storeIn === StoreIn.MEMORY
      ? memoryStorage()
      : diskStorage({
          destination: (req, file, cb) => cb(null, uploadPath),
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const uniqueName = `${Date.now()}-${Math.round(
              Math.random() * 1e9
            )}${ext}`;
            cb(null, uniqueName);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!type.includes(file.mimetype)) {
      const err: Error = new AppError("Unsupported file type", 409);
      return (cb as (error: Error | null, acceptFile: boolean) => void)(
        err,
        false
      );
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        storeIn === StoreIn.MEMORY ? FILE_SIZE_THRESHOLD : MAX_FILE_SIZE,
    },
  });
};
