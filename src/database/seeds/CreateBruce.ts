import { Connection } from 'typeorm';

import { User } from '../../../src/api/models/User';
import { Factory, Seed } from '../../lib/seed/types';

export class CreateBruce implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<User> {
        const em = connection.createEntityManager();

        const user = new User();
        user.username = 'bruce';
        user.email = 'bruce.wayne@wayne-enterprises.com';
        user.password = 'joker';
        return await em.save(user);
    }

}
