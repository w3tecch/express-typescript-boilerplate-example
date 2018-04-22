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
