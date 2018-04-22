import {
    Authorized, Body, CurrentUser, Delete, Get, JsonController, OnUndefined, Param, Post, Put
} from 'routing-controllers';

import { UserNotFoundError } from '../errors/UserNotFoundError';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { TaskService } from '../services/TaskService';
import { UserService } from '../services/UserService';

@Authorized()
@JsonController('/users')
export class UserController {

    constructor(
        private userService: UserService,
        private taskService: TaskService
    ) { }

    @Get()
    public find( @CurrentUser() user?: User): Promise<User[]> {
        return this.userService.find();
    }

    @Get('/me/tasks')
    public findMyTasks( @CurrentUser() user?: User): Promise<Task[]> {
        return this.taskService.findByUserId(user.id);
    }

    @Get('/:id')
    @OnUndefined(UserNotFoundError)
    public one( @Param('id') id: string): Promise<User | undefined> {
        return this.userService.findOne(id);
    }

    @Post()
    public create( @Body() user: User): Promise<User> {
        return this.userService.create(user);
    }

    @Put('/:id')
    public update( @Param('id') id: string, @Body() user: User): Promise<User> {
        return this.userService.update(id, user);
    }

    @Delete('/:id')
    public delete( @Param('id') id: string): Promise<void> {
        return this.userService.delete(id);
    }

}
