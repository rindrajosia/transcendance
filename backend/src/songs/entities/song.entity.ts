import { Reaction } from 'src/reaction/entities/reaction.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Index, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToMany } from 'typeorm';

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type:  'time' }) 
    duration: Date;

    @Column({ type: 'text', nullable: false})
    path: string;

    @Column({ type: 'text', unique: true, nullable: false})
    filename: string;

    @Column({ type: 'text', nullable: false})
    mimetype: string;

    @Column({ type: 'text', nullable: false})
    cover: string;

    @Column({ type: 'jsonb', default: {"like": 0, "love": 0,"angry": 0} })
    settings: Record<string, number>;

    @OneToMany(() => Reaction, (react) => react.song)
    public users: User[];

}