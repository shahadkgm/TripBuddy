// backend/src/services/mail.service.ts
import nodemailer from "nodemailer";

export class MailService {
  private transporter;

  constructor() {
    console.log("Checking Email Config from Mail service:", process.env.EMAIL_USER );

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });
  }

  async sendResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      console.log( "reset url",resetUrl)
      const mailOptions = {
        from: `"Trip Planner Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="background-color: #5537ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Reset Password
            </a>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Nodemailer Error Details:", error);
      throw error; // Rethrow to let the controller catch the 400 error
    }
  }
}