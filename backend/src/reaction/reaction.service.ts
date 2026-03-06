import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { ReactionType } from './enums/reaction-type.enum';
import { AddReactionDto } from 'src/songs/dto/add-reaction.dto';
import { RefreshTokenDto } from 'src/iam/authentication/dto/refresh-token.dto';
import jwtConfig from 'src/iam/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReactionService {
  constructor(
      @InjectRepository(Reaction) protected readonly reactionRepository: Repository<Reaction>,
      @InjectRepository(User) private readonly userRepository: Repository<User>,
  ){}


  async create(createReactionDto: AddReactionDto, user) {
    
        const reaction = new Reaction();
        reaction.song_id = createReactionDto.songId;
        reaction.user_id = user.sub;
        reaction.type = createReactionDto.type;

        const reactionRet = await this.reactionRepository.save(reaction);

        return reactionRet;
  }

  findAll() {
    return `This action returns all reaction`;
  }

  async findExisting(songId: number, user) {

    return await this.reactionRepository.findOne({
            where: {
                user_id: user.sub,
                song_id: songId
            }
        });
  }

  async update(id: number, type: ReactionType) 
  {
      const reaction = await this.reactionRepository.findOneOrFail(
        {
            where: { id }
        });
      if (!reaction) {
          throw new NotFoundException('Reaction not found');
      }

      return await this.reactionRepository.save({
          ...reaction,
          type
      });
  }

  async remove(id: number) {
    const reaction = await this.reactionRepository.findOneOrFail({
            where: { id }
        });
    return await this.reactionRepository.remove(reaction);
  }

}
