export interface IEmailService {
  sendOtp(to: string, otp: string): Promise<void>;
  sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}
