import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';


@Module({
    imports: [TypeOrmModule.forFeature([Role, User])],
    controllers: [RoleController],
    providers: [RoleService]
})
export class RoleModule {}
