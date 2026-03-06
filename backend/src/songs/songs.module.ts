import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { Reaction } from 'src/reaction/entities/reaction.entity';
import { ReactionService } from 'src/reaction/reaction.service';
import { ReactionModule } from 'src/reaction/reaction.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,Song]),
    ReactionModule
],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
