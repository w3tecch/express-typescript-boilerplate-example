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
