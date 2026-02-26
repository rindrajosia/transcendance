import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, MinLength } from "class-validator";

export class SignInDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(10)
    password: string;

    @IsOptional()
    @IsNumberString()
    tfaCode?: string
}
