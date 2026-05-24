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
}
