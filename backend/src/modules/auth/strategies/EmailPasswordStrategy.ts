import bcrypt from "bcryptjs";
import type { IAuthStrategy } from "../../../core/interfaces/IAuthStrategy";

export class EmailPasswordStrategy implements IAuthStrategy {
  readonly strategyName = "email-password";

  async authenticate(credentials: {
    passwordHash: string;
    inputPassword: string;
  }): Promise<boolean> {
    return bcrypt.compare(credentials.inputPassword, credentials.passwordHash);
  }
}
