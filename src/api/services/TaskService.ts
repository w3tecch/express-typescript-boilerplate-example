import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { NewTask } from '../controllers/requests/NewTask';
import { NotAllowedError } from '../errors/NotAllowedError';
import { Task } from '../models/Task';
import { User } from '../models/User';
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

    public async create(newTask: NewTask, currentUser: User): Promise<Task> {
        this.log.info('Create a new task for the current user');
        const task = new Task();
        task.title = newTask.title;
        task.userId = currentUser.id;
        task.isCompleted = false;
        return await this.taskRepository.save(task);
    }

    public async update(taskId: string, task: Task, currentUser: User): Promise<Task> {
        this.log.info('Update task of the current user');

        const currentTask = await this.taskRepository.findOneById(taskId);
        if (currentTask.userId !== currentUser.id) {
            throw new NotAllowedError();
        }

        task.id = taskId;
        return this.taskRepository.save(task);
    }

}
