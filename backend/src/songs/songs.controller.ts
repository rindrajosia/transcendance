import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, Header, Headers, Res, ParseIntPipe, HttpStatus, ParseFilePipeBuilder, UploadedFiles } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/iam/interfaces/active-user-data';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { RoleType } from 'src/roles/enums/role-type.enum';
import LocalFilesInterceptor, { LocalFilesInterceptorFields } from './utils/localFiles.interceptor';
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
    LocalFilesInterceptorFields({
      fields: [
        { name: 'cover', maxCount: 1 },
        { name: 'song', maxCount: 1 },
      ],
      path: '/songs',
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        const audioMaxSize = 500 * 1024 * 1024;// 500Mb
        const coverMaxSize = 100 * 1024 * 1024;// 100Mb

        if (file.fieldname === 'song') {
          const allowedAudio = ['.mp3', '.wav', '.ogg'];
          if (!file.mimetype.includes('audio') || !allowedAudio.includes(ext)) {
            return callback(new BadRequestException('Invalid audio'), false);
          }
          if(file.size > audioMaxSize) {
            return callback(new BadRequestException('Your song file is too big'), false);
          }
        }

        if (file.fieldname === 'cover') {
          const allowedImages = ['.png', '.jpg', '.jpeg'];
          if (!file.mimetype.includes('image') || !allowedImages.includes(ext)) {
            return callback(new BadRequestException('Invalid image'), false);
          }
          if(file.size > 1000) {
            return callback(new BadRequestException('Your cover file is too big'), false);
          }
        }

        callback(null, true);
      },
    }),
  )
  addSong(
   @UploadedFiles()
    files: {
      cover: Express.Multer.File[];
      song: Express.Multer.File[];
    },@Body() songCreateDto: CreateSongDto)
    {
      const cover = (files.cover)[0];
      const song = (files.song)[0];

      return this.songsService.create({
        filename: song.filename,
        path: song.path,
        mimetype: song.mimetype,
        cover: cover.path,
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


  @Get('cover/:id')
  async getFile(
      @Param('id',new ParseIntPipe({errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE})) id: number,
      @Res() res: Response
  ) {
      const path = await this.songsService.getCoverById(id);
      return res.sendFile(path);
  }
  
}
