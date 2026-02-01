// backend/src/services/mail.service.ts
import nodemailer, { Transporter } from "nodemailer";
import { IMailService } from "../interface/IMailService.js";

export class MailService implements IMailService {
  private transporter:Transporter

  constructor() {
    if(!process.env.EMAIL_USER||!process.env.EMAIL_PASS){
      throw new Error("Email credentials are not configurd")
    }
    if(!process.env.FRONTEND_URL){
      throw new Error("FRONTEND_URL is not configured")
    }
    console.log(
      "Checking Email Config from Mail service:",
      process.env.EMAIL_USER
    );

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      console.log("this is the reset link forgett password",resetUrl)

      const mailOptions = {
        from: `"Trip Planner Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="background-color: #5537ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);

      console.log("Password reset email sent to:", email);

    } catch (error) {
      console.error("Nodemailer Error:", error);
      throw error;
    }
  }
}
