import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Task } from './Task';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @IsNotEmpty()
    @Column({ name: 'first_name' })
    public firstName: string;

    @IsNotEmpty()
    @Column({ name: 'last_name' })
    public lastName: string;

    @IsNotEmpty()
    @Column()
    public username: string;

    @IsNotEmpty()
    @Column()
    public email: string;

    @Exclude()
    @Column()
    public password: string;

    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];

    public toString(): string {
        return `${this.firstName} ${this.lastName} (${this.email})`;
    }

    public toBase64(): string {
        return Buffer.from(`${this.username}:${this.password}`).toString('base64');
    }

}
