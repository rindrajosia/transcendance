import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { RoleType } from "../enums/role-type.enum";




export class CreatRoleDto {

    @IsNotEmpty()
    @IsEnum(RoleType, { message: 'role must be one of: admin, user' })
    role: RoleType;

}
