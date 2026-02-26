import { Controller, HttpStatus, ParseIntPipe, Param, Delete, Patch, Get, HttpException, Post, Body, BadRequestException } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreatRoleDto } from './dto/create-role.dto';

@Controller('role')
export class RoleController {
    constructor(
        private roleService: RoleService
    ){}

    @Get()
    async roles() {
        try {
            const roles = await this.roleService.findAllRoles();
            return roles;
        } catch (e) {
            throw  new  HttpException('server error', HttpStatus.INTERNAL_SERVER_ERROR,{ cause:  e }, ); 
        }
    }

    @Post()
    create(@Body() body: CreatRoleDto) {
        return this.roleService.saveRole(body);
    }
}
