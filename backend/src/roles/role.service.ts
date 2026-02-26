import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';


@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) protected readonly roleRepository: Repository<Role>,
    ){}


    async findAllRoles(): Promise <Role[]> {
    
        return await this.roleRepository.find({
                    select: {
                        id: true,
                        role: true
                    },
                })
    }

    async saveRole(body: CreatRoleDto): Promise <Role> {
        try {
            const role = new Role();
            role.role = body.role;

            return await this.roleRepository.save(role);
        } catch (err) {
            if (err.code === '23505') {
                throw new BadRequestException('Role already exists');
            }
            throw err;
        }
    }

    async findOneRole(options): Promise <Role | null> {
        try {
            const role = this.roleRepository.findOneBy(options);
            return role;
        } catch (err) {
            throw err;
        }
    }

}
