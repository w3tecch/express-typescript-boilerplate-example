<p align="center">
  <img src="./w3tec-logo.png" alt="w3tec" width="400" />
</p>

<h1 align="center">Example of Express Typescript Boilerplate</h1>

<p align="center">
  <b>A delightful way to building a Node.js RESTful API Services with beautiful code written in TypeScript.</b></br>
  <span>Inspired by the awesome framework <a href="https://laravel.com/">laravel</a> in PHP and of the repositories from <a href="https://github.com/pleerock">pleerock</a></span></br>
  <sub>Made with ❤️ by <a href="https://github.com/w3tecch">w3tech</a> and <a href="https://github.com/w3tecch/express-typescript-boilerplate/graphs/contributors">contributors</a></sub>
</p>

<br />

![divider](./w3tec-divider.png)

## ❯ Table of Contents

- [Getting Started](#-getting-started)
- [Requirements](#-requirements)
- [001 - Create task table in the database](#-001---create-task-table-in-the-database)
- [002 - Create seeds for the new entity task](#-002---create-seeds-for-the-new-entity-task)
- [003 - GET tasks of the current user](#-003---get-tasks-of-the-current-user)
- [004 - Update tasks of current user](#-004---update-tasks-of-current-user)
- [005 - Create tasks](#-005---create-tasks)
- [006 - Auth0 integration](#-006---auth0-integration)

![divider](./w3tec-divider.png)

## ❯ Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

Install yarn globally

```bash
npm install yarn -g
```

Install a MySQL database.

> If you work with a mac, we recommend to use homebrew for the installation.

### Step 2: Create new Project

Clone this project.

Then copy the `.env.example` file and rename it to `.env`. In this file you have to add your database connection information.

Create a new database with the name you have in your `.env`-file.

Then setup your application environment.

```bash
npm run setup
```

> This installs all dependencies with yarn. After that it migrates the database and seeds some test data into it. So after that your development environment is ready to use.

### Step 3: Serve your App

Go to the project dir and start your app with this npm script.

```bash
npm start serve
```

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the sever according to these changes.
> The server address will be displayed to you as `http://0.0.0.0:3000`.

![divider](./w3tec-divider.png)

## ❯ Requirements

- Run the server `yarn start serve` and open the swagger documentation link
- We going to implement these 3 routes:
  - GET `/users/me/tasks`
  - PUT `/tasks/:taskId`
  - POST `/users/me/tasks`

![divider](./w3tec-divider.png)

## ❯ 001 - Create task table in the database

Run `typeorm migration:create -n CreateTaskTable` to create a new migration.

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
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'user_id',
                type: 'varchar',
                length: 255,
                isPrimary: false,
                isNullable: false,
            },
        ]);
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('task');
    }

}
```

Run `typeorm migration:create -n AddUserRelationToTaskTable` to create a second migration for the relations between the user table and the task table.

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

Run migration `yarn start db.migrate` to update the database schema.

![divider](./w3tec-divider.png)

## ❯ 002 - Create seeds for the new entity task

Define a new `Task` entity.

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

Add tasks to the `User` entity,

```TypeScript
    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];
```

Create a new `TaskFactory`.

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

Update the seeds `CreateBruce.ts`.

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
        bruce.username = 'bruce';
        bruce.email = 'bruce.wayne@wayne-enterprises.com';
        bruce.password = 'joker';
        const user = await em.save(bruce);
        user.tasks = await factory(Task)({ user }).seedMany(4);
        return user;
    }

}

```

Update the seeds `CreateUsers.ts`

```TypeScript
import { Connection } from 'typeorm/connection/Connection';

import { User } from '../../../src/api/models/User';
import { Task } from '../../api/models/Task';
import { Factory, Seed, times } from '../../lib/seed';
import '../factories/TaskFactory';
import '../factories/UserFactory';

export class CreateUsers implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<any> {

        const em = connection.createEntityManager();
        await times(10, async (n) => {
            const user = await factory(User)().seed();
            const task = await factory(Task)({ user }).make();
            return await em.save(task);
        });

    }

}
```

**!!! for later**

```TypeScript
import { Connection } from 'typeorm/connection/Connection';

import { User } from '../../../src/api/models/User';
import { Task } from '../../api/models/Task';
import { Factory, Seed, times } from '../../lib/seed';
import '../factories/TaskFactory';
import '../factories/UserFactory';

export class CreateUsers implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<User[]> {
        const em = connection.createEntityManager();
        const users: User[] = [];
        await times(10, async (n) => {
            const user = await factory(User)().seed();
            const task = await factory(Task)({ user }).make();
            user.tasks = [await em.save(task)];
            users.push(user);
        });
        return users;
    }

}
```

Run `yarn start db.seed`.

Verify the seeded data in the database.

![divider](./w3tec-divider.png)

## ❯ 003 - GET tasks of the current user

Add a new e2d test `users.test.ts`.

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

Create a new `TaskRepository`.

```TypeScript
import { EntityRepository, Repository } from 'typeorm';

import { Task } from '../models/Task';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task>  {

}
```

Create a new `TaskService`.

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

Add a new endpoint to the `UserController`.

```TypeScript
    @Get('/me/tasks')
    public findMyTasks( @CurrentUser() user?: User): Promise<Task[]> {
        return this.taskService.findByUserId(user.id);
    }
```

![divider](./w3tec-divider.png)

## ❯ 004 - Update tasks of current user

Create `tasks.test.ts`.

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

    // TODO: Add tests here

});
```

```TypeScript
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
```

Add `update` method to the `TaskService`.

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

Create a new `TaskController`.

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

Create a new `NotAllowedError`.

```TypeScript
import { HttpError } from 'routing-controllers';

export class NotAllowedError extends HttpError {
    constructor() {
        super(403, 'You do not have the permission to do that!');
    }
}
```

![divider](./w3tec-divider.png)

## ❯ 005 - Create tasks

Add test to the `tasks.test.ts` file

```TypeScript
    test('POST: / should create a new task for bruce', async (done) => {
        const newTaskTitle = 'newTaskTitle';
        const newTask = {
            title: newTaskTitle,
        };
        const response = await request(settings.app)
            .post(`/api/tasks`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBeDefined();
        expect(response.body.title).toBe(newTaskTitle);
        expect(response.body.isCompleted).toBeFalsy();
        done();
    });
```

Create a new request class `NewTask`

```TypeScript
import { IsNotEmpty } from 'class-validator';

export class NewTask {

    @IsNotEmpty()
    public title: string;

}
```

Add new action to the `TaskService`

```TypeScript
    public async create(newTask: NewTask, currentUser: User): Promise<Task> {
        this.log.info('Create a new task for the current user');
        const task = new Task();
        task.title = newTask.title;
        task.userId = currentUser.id;
        task.isCompleted = false;
        return await this.taskRepository.save(task);
    }
```

Add new endpoint to the `TaskController`

```TypeScript
    @Post()
    public create( @Body() newTask: NewTask, @CurrentUser() user?: User): Promise<Task> {
        return this.taskService.create(newTask, user);
    }
```

![divider](./w3tec-divider.png)

## ❯ 006 - Auth0 integration

Install the auth0 dependencies `yarn add express-jwt @types/express-jwt jwks-rsa`

Change the `User` entity. Remove password and add auth0 prop.

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
    @Column()
    public username: string;

    @IsNotEmpty()
    @Column()
    public email: string;

    @Exclude()
    @Column()
    public auth0: string;

    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];

    public toString(): string {
        return `${this.username} (${this.email})`;
    }

}
```

Add finder method `findByAuth0` to the `UserRepository`

```TypeScript
    public async findByAuth0(auth0: string): Promise<User> {
        return this.findOne({
            where: { auth0 },
        });
    }
```

Adjust the `UserFactory`

```TypeScript
import * as Faker from 'faker';

import { User } from '../../../src/api/models/User';
import { define } from '../../lib/seed';

define(User, (faker: typeof Faker, settings: { role: string }) => {
    const gender = faker.random.number(1);
    const firstName = faker.name.firstName(gender);
    const lastName = faker.name.lastName(gender);
    const username = faker.internet.userName(firstName, lastName);
    const email = faker.internet.email(firstName, lastName);

    const user = new User();
    user.email = email;
    user.username = username;
    user.auth0 = `auht0|${username}`;
    return user;
});
```

Run `typeorm migration:create -n AddAuth0ToTheUserTable` to create a new migration.

```TypeScript
    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        const column = new TableColumn({
            name: 'auth0',
            type: 'varchar',
            length: '255',
        });
        await queryRunner.addColumn(table, column);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        await queryRunner.dropColumn(table, { name: 'auth0' } as TableColumn);
    }
```

Run `typeorm migration:create -n RemovePasswordFromUserTable` to create a new migration.

```TypeScript
    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        await queryRunner.dropColumn(table, { name: 'password' } as TableColumn);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        const column = new TableColumn({
            name: 'password',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: false,
        });
        await queryRunner.addColumn(table, column);
    }
```

Adjust the seed `CreateBruce`.

```TypeScript
+        bruce.auth0 = 'auth0|bruce';
-        bruce.password = 'joker';
```

Adjust all test with.

```TypeScript
+            .set('Authorization', `Bearer ${bruce.auth0}`)
.            .set('Authorization', `Basic ${bruce.toBase64()}`)
```

Add new methods to the `AuthService`.

```TypeScript
import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { env } from '../env';

@Service()
export class AuthService {

    private jwtRequestHandler: jwt.RequestHandler;

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) {
        this.jwtRequestHandler = jwt({
            secret: jwksRsa.expressJwtSecret({
                cache: env.auth.cache,
                rateLimit: env.auth.rateLimit,
                jwksRequestsPerMinute: env.auth.jwksRequestsPerMinute,
                jwksUri: env.auth.jwksUri,
            }),
            issuer: env.auth.issuer,
            algorithms: env.auth.algorithms,
        });
    }

    public jwtCheck(request: express.Request, response: express.Response): Promise<Error | undefined> {
        return new Promise((resolve, reject) => this.jwtRequestHandler(request, response, resolve));
    }

    public simulateJwtCheckForTest(request: express.Request): boolean {
        const getToken = (req: express.Request): string | undefined => {
            const authorization = req.header('authorization');
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                return authorization.split(' ')[1];
            }
            return undefined;
        };

        const token = getToken(request);
        if (token) {
            request.user = new User();
            request.user.sub = token;
            return true;
        }
        return false;
    }

    ...

}
```

Change the `authorizationChecker`

```TypeScript
import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { env } from '../env';
import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: any[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {

        if (env.isTest) {
            return authService.simulateJwtCheckForTest(action.request);
        }

        const jwtError = await authService.jwtCheck(action.request, action.response);
        if (jwtError && jwtError.message) {
            log.warn(jwtError.message);
            return false;
        }
        return true;

    };
}
```

Change the `currentUserChecker`

```TypeScript
import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';

export function currentUserChecker(connection: Connection): (action: Action) => Promise<User | undefined> {

    return async function innerCurrentUserChecker(action: Action): Promise<User | undefined> {

        const userRepository = connection.getCustomRepository<UserRepository>(UserRepository);
        let user = await userRepository.findByAuth0(action.request.user.sub);
        if (!user) {
            const newUser = new User();
            newUser.username = action.request.user.nickname;
            newUser.email = action.request.user.email;
            newUser.auth0 = action.request.user.sub;
            user = await userRepository.save(newUser);
        }

        return user;

    };
}
```

![divider](./w3tec-divider.png)

## ❯ Related Projects

- [express-typescript-boilerplate](https://github.com/w3tecch/express-typescript-boilerplate) - A delightful way to building a RESTful API with NodeJs & TypeScript by @w3tecch.
- [aurelia-typescript-boilerplate](https://github.com/w3tecch/aurelia-typescript-boilerplate) - An Aurelia starter kit with TypeScript
- [Auth0 Mock Server](https://github.com/hirsch88/auth0-mock-server) - Useful for e2e testing or faking an oAuth server

![divider](./w3tec-divider.png)

## ❯ License

[MIT](/LICENSE)
