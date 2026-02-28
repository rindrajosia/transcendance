import { IsNotEmpty, IsString, IsNumber, IsDateString, IsMilitaryTime } from 'class-validator';

export class CreateSongDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsMilitaryTime()
    @IsNotEmpty()
    duration: string;
}
