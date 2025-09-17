import { NextFunction, Request, Response } from "express";

interface IUserServices {
  sayHello(req: Request, res: Response, next: NextFunction): Response;
  getUser(req: Request, res: Response, next: NextFunction): Response;
}

export class UserServices implements IUserServices {
  constructor() {}
  sayHello(req: Request, res: Response, next: NextFunction): Response {
    return res.json({ msg: "Hello form user router" });
  }
  getUser(req: Request, res: Response, next: NextFunction): Response {
    return res.json({
      name: "Mohamed Hassan",
      age: 72,
    });
  }
}
