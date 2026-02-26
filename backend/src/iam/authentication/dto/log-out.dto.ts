import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, MinLength } from "class-validator";

export class LogOutDto {
    @IsNotEmpty()
    refreshToken: string;

}