import { RoleType } from "src/roles/enums/role-type.enum";

export interface ActiveUserData {
    sub: number;
    email: string;
    role: RoleType;
}