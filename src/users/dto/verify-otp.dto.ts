// src/users/dto/verify-otp.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsString()
  email: string; // Or use phoneNumber: string; if you're verifying OTP for a phone number
}
