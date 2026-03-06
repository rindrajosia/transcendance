import { Module } from '@nestjs/common';
import { ResetController } from './reset.controller';
import { ResetService } from './reset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reset } from './reset.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { IamModule } from '../iam.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([User, Reset]),
      MailerModule.forRoot({
        transport: {
          host: '0.0.0.0',
          port: 1025
        },
        defaults:{
          from: 'josia@gmail.com'
        }
      }),
      UsersModule, 
      IamModule,
    ],
  controllers: [ResetController],
  providers: [ResetService]
})
export class ResetModule {}
