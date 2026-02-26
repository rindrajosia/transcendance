import { Entity, Index, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoleType } from '../enums/role-type.enum';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: RoleType,
        unique: true,
        default: RoleType.USER
    })
    role: RoleType

    @OneToMany(() => User, user => user.role)
    users: User[];
}
