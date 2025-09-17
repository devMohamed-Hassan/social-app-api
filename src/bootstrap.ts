import express from "express";
import dotenv from "dotenv";
import path from "path";
import routers from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config({
  path: path.resolve("./src/config/.env"),
});

const app = express();

export const bootstrap = () => {
  app.use(express.json());

  app.use("/api/v1", routers);
  app.use(errorHandler);

  const port = process.env.PORT || 5000;

  app.get("/", (req, res, next) => {
    res.json({
      message: "Welcome to the Social App",
    });
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};
