import { Entity, Index, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';


@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Index('UQ_user_email', { unique: true })
    @Column()
    email: string;

    @Column({nullable: true})
    password: string;

    @Column({ type: 'text', nullable: true })
    avatar_url: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({nullable: true})
    googleId: string;

    @Column({default: false})
    isTfaEnabled: Boolean;

    @Column({ type: 'varchar', nullable: true })
    tfaSecret: string | null;

    @ManyToOne(() => Role, { eager: true, nullable: false })
    role: Role;

    
}