import { IUser } from "../models/user.model";
import { Payload } from "../services/token/verifyToken";

declare global {
  namespace Express {
    interface Request {
      user?: Partial<IUser>;
      payload?: Payload;
    }
  }
}
