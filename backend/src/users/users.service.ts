import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/iam/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ){}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async finByEmail(email: string) {
    return await this.usersRepository.findOne({where: { email: email}});
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async update(id: number, options: Partial<User>): Promise<User> {
      const user = await this.usersRepository.findOne({
          where: { id: id }
      });

      if (!user) {
          throw new NotFoundException('User not found');
      }

      return await this.usersRepository.save({
          ...user,
          ...options
      });
  }
}
