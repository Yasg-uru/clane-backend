import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env";
import type { IEmailService } from "../../core/interfaces/IEmailService";

export class EmailService implements IEmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Your CreatorLane verification code",
      text: `Your CreatorLane OTP is ${otp}. It expires in 10 minutes.`,
      html: this.buildOtpHtml(otp),
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Reset your CreatorLane password",
      text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.`,
      html: this.buildPasswordResetHtml(resetUrl),
    });
  }

  private buildOtpHtml(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Verify your CreatorLane email</h2>
        <p>Your one-time password is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;
  }

  private buildPasswordResetHtml(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5; max-width: 480px;">
        <h2 style="margin: 0 0 12px;">Reset your CreatorLane password</h2>
        <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>
        <a href="${resetUrl}"
           style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #db2777, #f97316); color: #fff; font-weight: 700; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 13px;">This link expires in 15 minutes. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
        <p style="color: #6b7280; font-size: 12px; word-break: break-all;">If the button above doesn't work, copy and paste this URL: ${resetUrl}</p>
      </div>
    `;
  }
}
