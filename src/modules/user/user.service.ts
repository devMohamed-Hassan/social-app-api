import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";

interface IUserServices {
  sayHello(req: Request, res: Response, next: NextFunction): Response;
  getUser(req: Request, res: Response, next: NextFunction): void;
}

export class UserServices implements IUserServices {
  constructor() {}
  sayHello(req: Request, res: Response, next: NextFunction): Response {
    return res.json({ msg: "Hello form user router" });
  }
  getUser(req: Request, res: Response, next: NextFunction): void {
    throw new AppError("User Not Found", 404);
  }
}
