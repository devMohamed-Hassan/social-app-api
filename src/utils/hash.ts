import { compare, hash } from "bcrypt";
import { ENV } from "../config/env";

export class Bcrypt {
  private static readonly saltRounds: number = ENV.SALT_ROUNDS;
  
  

  static async hashPassword(password: string): Promise<string> {
    return await hash(password, this.saltRounds);
  }

  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }
}
