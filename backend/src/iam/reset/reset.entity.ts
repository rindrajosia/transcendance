import { Entity, Index, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('resets')
export class Reset {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({ unique: true })
    token: string;
    
    @Column()
    expiresAt: Date;

}