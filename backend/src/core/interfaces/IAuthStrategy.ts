export interface IAuthStrategy {
  readonly strategyName: string;
  authenticate(credentials: { passwordHash: string; inputPassword: string }): Promise<boolean>;
}
