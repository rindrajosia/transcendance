import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reset } from './reset.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { ResetDto } from '../authentication/dto/reset.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ResetService {
    constructor(
        @InjectRepository(Reset) protected readonly resetRepository: Repository<Reset>,
        private readonly hashingService: HashingService,
        private readonly userService: UsersService,
    ){}

    async save(body){
        return this.resetRepository.save(body);
    }

    async findOne(options) {
        return this.resetRepository.findOneBy(options);
    }

    async update(resetDto: ResetDto){
        const {token, password, confirm_password } = resetDto;
        if (password !== confirm_password)
            throw new BadRequestException('Passwords do not match');

        const reset = await this.findOne({token});
        
        if (!reset)
            throw new NotFoundException('Invalid Token');

        if (reset.expiresAt < new Date()) {
            await this.resetRepository.delete(reset);
            throw new BadRequestException('Token expired');
        }

        const user = await this.userService.finByEmail(reset.email);

        if (!user)
            throw new NotFoundException('User not found');

        await this.userService.update(user.id, { password: await this.hashingService.hash(password)});
    }

}
