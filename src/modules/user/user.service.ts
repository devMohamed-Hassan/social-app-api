import { NextFunction, Request, Response } from "express";

interface IUserServices {
  signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
}

export class UserServices implements IUserServices {
  constructor() {}

  async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { name, email, password } = req.body;
    
    return res.json({ msg: "Done" });
  }
}
