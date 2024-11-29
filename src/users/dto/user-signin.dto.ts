import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class UserSignInDto {
    @IsNotEmpty({message: "Email is required"})
    @IsEmail({},{message: "Invalid email"})
    email: string;

    @IsNotEmpty({message: "Password is required"})
    @MinLength(5,{message: "Password must be at least 5 characters"})
    password: string;
}