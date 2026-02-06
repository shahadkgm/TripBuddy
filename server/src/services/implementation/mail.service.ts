// backend/src/services/mail.service.ts
import nodemailer, { Transporter } from 'nodemailer';
import { IMailService } from '../interface/IMailService.js';

export class MailService implements IMailService {
  private transporter:Transporter;

  constructor() {
    if(!process.env.EMAIL_USER||!process.env.EMAIL_PASS){
      throw new Error('Email credentials are not configurd');
    }
    if(!process.env.FRONTEND_URL){
      throw new Error('FRONTEND_URL is not configured');
    }
    console.log(
      'Checking Email Config from Mail service:',
      process.env.EMAIL_USER
    );

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      console.log('this is the reset link forgett password',resetUrl);

      const mailOptions = {
        from: `"Trip Planner Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
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

      console.log('Password reset email sent to:', email);

    } catch (error) {
      console.error('Nodemailer Error:', error);
      throw error;
    }
  }
  async sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
): Promise<void> {
  const mailOptions = {
    from: `"Trip Buddy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome, ${name} 👋</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verificationLink}"
           style="background:#5537ee;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p style="margin-top:12px;font-size:12px;">
          Or copy this link: ${verificationLink}
        </p>
      </div>
    `,
  };

  await this.transporter.sendMail(mailOptions);
}


}
