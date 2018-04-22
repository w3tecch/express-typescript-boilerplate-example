import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './User';

@Entity()
export class Task {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @IsNotEmpty()
    @Column()
    public title: string;

    @IsNotEmpty()
    @Column({ name: 'is_completed' })
    public isCompleted: boolean;

    @Column({
        name: 'user_id',
        nullable: true,
    })
    public userId: string;

    @ManyToOne(type => User, user => user.tasks)
    @JoinColumn({ name: 'user_id' })
    public user: User;

    public toString(): string {
        return `${this.title}`;
    }
}
