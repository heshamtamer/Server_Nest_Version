import { createHash, randomInt } from 'crypto';

export async function generateOTP(): Promise<string> {
    const otp =  randomInt(100000, 999999).toString(); // 6-digit OTP
    return otp;
}
