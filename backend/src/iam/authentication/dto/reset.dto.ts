import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class ResetDto {

    
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @MinLength(10)
    password: string;

    @IsNotEmpty()
    confirm_password: string;
}
