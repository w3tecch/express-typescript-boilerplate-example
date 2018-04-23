import {
    Authorized, Body, CurrentUser, JsonController, Param, Post, Put
} from 'routing-controllers';

import { Task } from '../models/Task';
import { User } from '../models/User';
import { TaskService } from '../services/TaskService';
import { NewTask } from './requests/NewTask';

@Authorized()
@JsonController('/tasks')
export class TaskController {

    constructor(
        private taskService: TaskService
    ) { }

    @Post()
    public create( @Body() newTask: NewTask, @CurrentUser() user?: User): Promise<Task> {
        return this.taskService.create(newTask, user);
    }

    @Put('/:id')
    public update( @Param('id') id: string, @Body() task: Task, @CurrentUser() user?: User): Promise<Task> {
        return this.taskService.update(id, task, user);
    }

}
