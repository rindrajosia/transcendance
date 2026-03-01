import { Entity, Index, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';

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

}