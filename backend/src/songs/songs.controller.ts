import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, Header, Headers, Res, ParseIntPipe, HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/iam/interfaces/active-user-data';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { RoleType } from 'src/roles/enums/role-type.enum';
import LocalFilesInterceptor from './utils/localFiles.interceptor';
import type { Express, Response } from 'express';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { extname } from 'path';


@Auth(AuthType.None)
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
      path: '/videos',
      fileFilter: (request, file, callback) => {
        const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const fileExtension = extname(file.originalname).toLowerCase();
        if (!file.mimetype.includes('video') || !allowedExtensions.includes(fileExtension)) {
          return callback(
            new BadRequestException('Provide a valid video'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  addSong(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 500 * 1024 * 1024 }) // 500Mb
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
  file: Express.Multer.File,@Body() songCreateDto: CreateSongDto) {
    return this.songsService.create({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      }, songCreateDto);
  }

  @Get(':id')
  @Header('Accept-Ranges', 'bytes')
  async streamSong(
    @Param('id',new ParseIntPipe({errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE})) id: number,
    @Headers('range') range: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!range) {
      return this.songsService.getVideoStreamById(id);
    }
    const { streamableFile, contentRange } =
      await this.songsService.getPartialSongStream(id, range);

    response.status(206);

    response.set({
      'Content-Range': contentRange,
    });

    return streamableFile;
  }

  @Delete(':id')
  async delete(
      @Param('id',new ParseIntPipe({errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE})) id: number,
  ) {
      await this.songsService.delete(id);
  }
  
}
