import bcrypt from "bcryptjs";
import type { IAuthStrategy } from "../../../core/interfaces/IAuthStrategy";
import { BCRYPT_SALT_ROUNDS } from "../auth.constants";

export class EmailPasswordStrategy implements IAuthStrategy {
  readonly strategyName = "email-password";

  async authenticate(credentials: {
    passwordHash: string;
    inputPassword: string;
  }): Promise<boolean> {
    return bcrypt.compare(credentials.inputPassword, credentials.passwordHash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }
}
