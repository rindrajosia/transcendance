import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { Song } from './entities/song.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoDto } from './dto/song.dto';
import RangeParser from 'range-parser';
import { stat } from 'fs/promises';
import { join } from 'path';
import { createReadStream, existsSync, } from 'fs';
import { unlink } from 'fs/promises';
import * as fs from 'fs';

@Injectable()
export class SongsService {
  constructor(
      @InjectRepository(Song) private readonly songsRepository: Repository<Song>,
  ){}

  async create(metaData: VideoDto, extraData: CreateSongDto ) {
    try {
        const song = new Song();
        song.title = extraData.title;
        song.duration = new Date(`1970-01-01T${extraData.duration}:00`);
        song.path = metaData.path;
        song.filename = metaData.filename;
        song.mimetype = metaData.mimetype;
        song.cover = metaData.cover;
        await this.songsRepository.save(song);
    } catch (err) {
        console.error(err);
        const pgUniqueViolationErrorCode = '23505';
        if(err.code === pgUniqueViolationErrorCode) {
            throw new ConflictException('Email already exists');
        }
        throw err;
    }
  }

  async getSongMetadata(id: number) {

    const song = await this.songsRepository.findOne({where: {id},});

    if (!song) {
      throw new NotFoundException();
    }

    const songMetada: VideoDto = {filename: song.filename, path: song.path, mimetype: song.mimetype, cover: song.cover};
    return songMetada;
  }

  parseRange(range: string, fileSize: number) {
    const parseResult = RangeParser(fileSize, range);
    if (parseResult === -1 || parseResult === -2 || parseResult.length !== 1) {
      throw new BadRequestException();
    }
    return parseResult[0];
  }

  async getFileSize(path: string) {
    const status = await stat(path);

    return status.size;
  }

  getContentRange(rangeStart: number, rangeEnd: number, fileSize: number) {
    return `bytes ${rangeStart}-${rangeEnd}/${fileSize}`;
  }

  async getPartialSongStream(id: number, range: string) {
    const songMetadata = await this.getSongMetadata(id);
    const songPath = join(process.cwd(), songMetadata.path);
    const fileSize = await this.getFileSize(songPath);

    const { start, end } = this.parseRange(range, fileSize);

    const stream = createReadStream(songPath, { start, end });

    const streamableFile = new StreamableFile(stream, {
      disposition: `inline; filename="${songMetadata.filename}"`,
      type: songMetadata.mimetype,
    });

    const contentRange = this.getContentRange(start, end, fileSize);

    return {
      streamableFile,
      contentRange,
    };
  }

  async getVideoStreamById(id: number) {
    const songMetadata = await this.getSongMetadata(id);
    
    if (!existsSync(songMetadata.path)) {
      throw new NotFoundException('File not found on disk');
    }
    
    const stream = createReadStream(join(process.cwd(), songMetadata.path));

    return new StreamableFile(stream, {
      disposition: `inline; filename="${songMetadata.filename}"`,
      type: songMetadata.mimetype,
    });
  }

  async getCoverById(id: number) {
    const songMetadata = await this.getSongMetadata(id);
    
    if (!existsSync(songMetadata.cover)) {
      throw new NotFoundException('File not found on disk');
    }
    const filePath = join(process.cwd(), songMetadata.cover);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

     return filePath;
  }

  async delete(id: number) {
    const song = await this.songsRepository.findOne({ where: { id } });

    if (!song) {
      throw new NotFoundException();
    }

    if (existsSync(song.path)) {
      try {
        await unlink(song.path);
      } catch (err) {
        throw new InternalServerErrorException('Failed to delete file');
      }
    }

    return await this.songsRepository.remove(song);
  }
  
}
