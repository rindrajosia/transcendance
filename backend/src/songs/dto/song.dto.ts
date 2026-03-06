import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class SongDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsString()
    @IsNotEmpty()
    path: string;

    
    @IsString()
    @IsNotEmpty()
    mimetype: string;

    @IsString()
    cover?: string;
}