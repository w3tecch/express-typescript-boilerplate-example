import { Connection } from 'typeorm';

import { Task } from '../../../src/api/models/Task';
import { User } from '../../../src/api/models/User';
import { Factory, Seed } from '../../lib/seed/types';

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
        await factory(Task)({ user }).seedMany(4);
        return user;

    }

}
