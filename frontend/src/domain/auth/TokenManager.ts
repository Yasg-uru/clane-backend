export class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  set(token: string): void {
    this.accessToken = token;
  }

  get(): string | null {
    return this.accessToken;
  }

  clear(): void {
    this.accessToken = null;
  }

  hasToken(): boolean {
    return this.accessToken !== null;
  }
}
