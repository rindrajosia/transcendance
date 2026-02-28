import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class VideoDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsString()
    @IsNotEmpty()
    path: string;

    
    @IsString()
    @IsNotEmpty()
    mimetype: string;
}