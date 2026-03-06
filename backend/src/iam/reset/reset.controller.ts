import { BadRequestException, Body, ConflictException, Controller, NotFoundException, Post } from '@nestjs/common';
import { ResetService } from './reset.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcryptjs from 'bcryptjs';
import { ResetDto } from '../authentication/dto/reset.dto';
import { UsersService } from 'src/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { AuthType } from '../authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller("authentication")
export class ResetController {
    constructor(
        private resetService: ResetService,
        private mailerService: MailerService,        
    ){}

    @Post('forget')
    async forgot(@Body('email') email: string)
    {
        
        try {
            const token = Math.random().toString(20).substring(2, 12);

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);
            
            await this.resetService.save({
                email,
                token,
                expiresAt
            });

            const url = `http://localhost:3000/reset/${token}`;

            await this.mailerService.sendMail({
                to: email,
                subject: 'Reset your password',
                html: `Click <a href="${url}">here</a> to reset your password`
            });

            return {
                message: 'Check your email'
            }
        } catch (err) {
            console.error(err);

            const pgUniqueViolationErrorCode = '23505';
            if(err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException('Token already exists');
            }
            throw err;
        }
}

    
    @Post('reset')
    async reset(
        @Body() resetDto: ResetDto,
    ) {
        try {
            await this.resetService.update(resetDto);

            return {
                message: 'Success'
            }
        } catch (err) {
            throw err;
        }
    }
}