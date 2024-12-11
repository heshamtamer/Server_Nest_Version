import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // Should be 'smtp.gmail.com'
    port: Number(process.env.MAIL_PORT), // Should be 587
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // Gmail address
      pass: process.env.MAIL_PASSWORD, // Gmail app password
    },
  });

  async sendOTP(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM, // Sender address
      to: email, // Recipient address
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. This code will expire in 10 minutes.`,
    });
  }
}
