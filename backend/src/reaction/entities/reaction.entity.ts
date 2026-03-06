import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Index, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn, PrimaryColumn, Unique } from 'typeorm';
import { ReactionType } from '../enums/reaction-type.enum';

@Entity('reactions')
@Unique(['user_id', 'song_id'])
export class Reaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    song_id: number;

    @Column({
        type: 'enum',
        enum: ReactionType,
        default: ReactionType.LIKE,
    })
    type: ReactionType;

    @ManyToOne(() => User, (user) => user.songs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Song, (song) => song.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'song_id' })
    song: Song;
}
