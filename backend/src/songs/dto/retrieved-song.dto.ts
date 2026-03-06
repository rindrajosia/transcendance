import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class RetrievedSongDto {
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
    @IsNotEmpty()
    cover: string;
}