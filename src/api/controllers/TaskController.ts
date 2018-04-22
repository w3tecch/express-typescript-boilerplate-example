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
