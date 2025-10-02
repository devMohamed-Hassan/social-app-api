import { compare, hash } from "bcrypt";
import { ENV } from "../config/env";

export class Bcrypt {
  private static readonly saltRounds: number = ENV.SALT_ROUNDS;

  static async hash(plainText: string): Promise<string> {
    return await hash(plainText, this.saltRounds);
  }

  static async compare(
    plainText: string,
    cipherText: string
  ): Promise<boolean> {
    return await compare(plainText, cipherText);
  }
}
