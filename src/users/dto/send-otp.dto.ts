// src/users/dto/send-otp.dto.ts

import { IsString, IsNotEmpty, IsPhoneNumber, IsEmail } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()  // Use @IsPhoneNumber() if you're sending OTP to a phone number
  email: string; // Or use phoneNumber: string; if you're sending OTP to a phone number
}
