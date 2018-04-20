import { Connection } from 'typeorm';

import { User } from '../../../src/api/models/User';
import { Factory, Seed } from '../../lib/seed/types';

export class CreateBruce implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<User> {
        const em = connection.createEntityManager();

        const user = new User();
        user.firstName = 'Bruce';
        user.lastName = 'Wayne';
        user.username = 'batman';
        user.email = 'bruce.wayne@wayne-enterprises.com';
        user.password = 'alfred';
        return await em.save(user);
    }

}
