# Script Demo

## Show swagger

- Run server and hit swagger doc

## Database

- Show empty Database
- Run migration `yarn start db.migrate`
- Run seeds `yarn start db.seed`

## 001 - Create a migration

> `typeorm migration:create -n CreateTaskTable`

```TypeScript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTaskTable1524308957165 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table('task', [
            {
                name: 'id',
                type: 'varchar',
                length: 255,
                isPrimary: true,
                isNullable: false,
            }, {
                name: 'title',
                type: 'varchar',
                length: 255,
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'is_completed',
                type: 'boolean',
                default: false,
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'user_id',
                type: 'varchar',
                length: 255,
                isPrimary: false,
                isNullable: true,
            },
        ]);
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('task');
    }

}
```

> `typeorm migration:create -n AddUserRelationToTaskTable`

```TypeScript
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddUserRelationToTaskTable1524382160144 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey(
        'fk_user_task',
        ['user_id'],
        ['id'],
        'task',
        ''
    );

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createForeignKey('task', this.tableForeignKey);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('task', this.tableForeignKey);
    }

}
```

> Run migration `yarn start db.migrate`

## 002 - Create seeds

> Define a new `Task` entity

```TypeScript
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
```

> Add tasks to the `User` entity

```TypeScript
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
```

> Create a new `TaskFactory`

```TypeScript
import * as Faker from 'faker';

import { Task } from '../../../src/api/models/Task';
import { User } from '../../api/models/User';
import { define } from '../../lib/seed';

define(Task, (faker: typeof Faker, settings: { user: User }) => {
    const title = faker.lorem.words(faker.random.number({ min: 1, max: 5 }));
    const isCompleted = faker.random.boolean();

    const task = new Task();
    task.title = title;
    task.isCompleted = isCompleted;
    task.userId = settings.user.id;
    return task;
});

```

> Update the seeds `CreateBruce.ts`

```TypeScript
import { Connection } from 'typeorm';

import { Task } from '../../../src/api/models/Task';
import { User } from '../../../src/api/models/User';
import { Factory, Seed } from '../../lib/seed/types';
import '../factories/TaskFactory';
import '../factories/UserFactory';

export class CreateBruce implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<User> {
        const em = connection.createEntityManager();
        const bruce = new User();
        bruce.firstName = 'Bruce';
        bruce.lastName = 'Wayne';
        bruce.username = 'batman';
        bruce.email = 'bruce.wayne@wayne-enterprises.com';
        bruce.password = 'alfred';
        const user = await em.save(bruce);
        user.tasks = await factory(Task)({ user }).seedMany(4);
        return user;
    }

}
```

> Update the seeds `CreateUsers.ts`

```TypeScript
import { Connection } from 'typeorm/connection/Connection';

import { User } from '../../../src/api/models/User';
import { Task } from '../../api/models/Task';
import { Factory, Seed, times } from '../../lib/seed';
import '../factories/TaskFactory';
import '../factories/UserFactory';

export class CreateUsers implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<User[]> {

        const users = [];
        const em = connection.createEntityManager();
        await times(10, async (n) => {
            const user = await factory(User)().seed();
            const task = await factory(Task)({ user }).make();
            const savedTask = await em.save(task);
            user.tasks = [savedTask];
            users.push(user);
        });
        return users;

    }

}
```

> Run `yarn start db.seed`
> Verify the seeded data in the database

## 003 - GET tasks of the current user

> Add a new e2d test `users.test.ts`

```TypeScript
    test('GET: /me/tasks should return all tasks of bruce', async (done) => {
        const response = await request(settings.app)
            .get(`/api/users/me/tasks`)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.length).toBe(bruce.tasks.length);
        expect(response.body[0].id).toBe(bruce.tasks[0].id);
        done();
    });
```

> Create a new `TaskRepository`

```TypeScript
import { EntityRepository, Repository } from 'typeorm';

import { Task } from '../models/Task';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task>  {

}
```

> Create a new `TaskService`

```TypeScript
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Task } from '../models/Task';
import { TaskRepository } from '../repositories/TaskRepository';

@Service()
export class TaskService {

    constructor(
        @OrmRepository() private taskRepository: TaskRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public findByUserId(userId: string): Promise<Task[]> {
        this.log.info('Find all tasks of the current user');
        return this.taskRepository.find({
            where: { userId },
        });
    }

}
```

> Add a new endpoint to the `UserController`

```TypeScript
    @Get('/me/tasks')
    public findMyTasks( @CurrentUser() user?: User): Promise<Task[]> {
        return this.taskService.findByUserId(user.id);
    }
```

## 004 - Update tasks of current user

> Create `tasks.test.ts`

```TypeScript
import * as nock from 'nock';
import * as request from 'supertest';

import { User } from '../../../src/api/models/User';
import { CreateBruce } from '../../../src/database/seeds/CreateBruce';
import { CreateUsers } from '../../../src/database/seeds/CreateUsers';
import { runSeed } from '../../../src/lib/seed';
import { closeDatabase } from '../../utils/database';
import { BootstrapSettings } from '../utils/bootstrap';
import { prepareServer } from '../utils/server';

describe('/api/tasks', () => {

    let bruce: User;
    let otherUsers: User[];
    let settings: BootstrapSettings;

    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    beforeAll(async () => {
        settings = await prepareServer({ migrate: true });
        bruce = await runSeed<User>(CreateBruce);
        otherUsers = await runSeed<User[]>(CreateUsers);
    });

    // -------------------------------------------------------------------------
    // Tear down
    // -------------------------------------------------------------------------

    afterAll(async () => {
        nock.cleanAll();
        await closeDatabase(settings.connection);
    });

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('PUT: / should update the task', async (done) => {
        const newTaskTitle = 'newTaskTitle';
        const newTask = Object.assign({}, bruce.tasks[0], {
            title: newTaskTitle,
        });
        const response = await request(settings.app)
            .put(`/api/tasks/${bruce.tasks[0].id}`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBe(bruce.tasks[0].id);
        expect(response.body.title).toBe(newTaskTitle);
        done();
    });

    test('PUT: / should return 403 if the current user is not the owner of the task', async (done) => {
        const task = otherUsers[0].tasks[0];
        const newTaskTitle = 'newTaskTitle';
        const newTask = Object.assign({}, task, {
            title: newTaskTitle,
        });
        await request(settings.app)
            .put(`/api/tasks/${task.id}`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(403);

        done();
    });

});
```

> Add `update` method to the `TaskService`

```TypeScript
    public async update(taskId: string, task: Task, currentUser: User): Promise<Task> {
        this.log.info('Update task of the current user');

        const currentTask = await this.taskRepository.findOneById(taskId);
        if (currentTask.userId !== currentUser.id) {
            throw new NotAllowedError();
        }

        task.id = taskId;
        return this.taskRepository.save(task);
    }
```

> Create a new `TaskController`

```TypeScript
import { Authorized, Body, CurrentUser, JsonController, Param, Put } from 'routing-controllers';

import { Task } from '../models/Task';
import { User } from '../models/User';
import { TaskService } from '../services/TaskService';

@Authorized()
@JsonController('/tasks')
export class TaskController {

    constructor(
        private taskService: TaskService
    ) { }

    @Put('/:id')
    public update( @Param('id') id: string, @Body() task: Task, @CurrentUser() user?: User): Promise<Task> {
        return this.taskService.update(id, task, user);
    }

}
```

> Create a new `NotAllowedError`

```TypeScript
import { HttpError } from 'routing-controllers';

export class NotAllowedError extends HttpError {
    constructor() {
        super(403, 'You do not have the permission to do that!');
    }
}

```
