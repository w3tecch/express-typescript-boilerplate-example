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
