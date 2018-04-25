import { EntityRepository, Repository } from 'typeorm';

import { User } from '../models/User';

@EntityRepository(User)
export class UserRepository extends Repository<User>  {

    public async findByAuth0(auth0: string): Promise<User> {
        return this.findOne({
            where: { auth0 },
        });
    }

}
