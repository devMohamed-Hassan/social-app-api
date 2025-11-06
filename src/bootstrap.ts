import http from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import routers from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { S3Service } from "./services/s3.service";
import { AppError } from "./utils/AppError";
import { initializeSocket } from "./services/gateway";

const streamPipeline = promisify(pipeline);

export const bootstrap = () => {
  const app = express();
  app.use(cors());

  app.use(express.json());

  connectDB();

  app.get("/", (req, res) => {
    const egyptTime = new Date().toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    res.status(200).json({
      success: true,
      message: "Welcome to the Social App Backend API",
      version: "1.0.0",
      serverTime: egyptTime,
      developedBy: {
        name: "Mohamed Hassan Esmail",
        role: "Full-Stack Developer",
        contact: {
          email: "mohamed.h.ismael@gmail.com",
          github: "https://github.com/devMohamed-Hassan",
          linkedin:
            "https://www.linkedin.com/in/mohamed-hassan-esmail-7590b22bb/",
        },
      },
      description:
        "A modern backend API for a social media platform with real-time features.",
      note: "For API access credentials <Bearer token> and the Postman collection, please contact the developer directly via email.",
    });
  });

  app.use("/api/v1", routers);

  app.get(
    "/assets/*path",
    async (req: Request, res: Response, next: NextFunction) => {
      const { path } = req.params as unknown as { path: string[] };

      const key = path.join("/");
      if (!key) throw new AppError("Asset path is required", 400);
      const shouldDownload =
        req.query.download === "true" || req.query.download === "1";
      const customName =
        typeof req.query.name === "string" ? req.query.name : null;

      const s3service = new S3Service();
      const stream = await s3service.getAsset({ key });

      if (!stream?.Body) throw new AppError("File not found", 404);

      const originalName = key.split("/").pop() || "file";
      const filename = customName || originalName;

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader(
        "Content-Type",
        stream.ContentType || "application/octet-stream"
      );

      if (shouldDownload) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(filename)}"`
        );
      } else {
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(filename)}"`
        );
      }
      await streamPipeline(stream.Body as NodeJS.ReadableStream, res);
    }
  );

  app.use(errorHandler);

  const httpServer = http.createServer(app);
  const io = initializeSocket(httpServer);

  httpServer.listen(ENV.PORT, () => {
    console.log(`Server running on http://localhost:${ENV.PORT}`);
  });

  return { app, io };
};
