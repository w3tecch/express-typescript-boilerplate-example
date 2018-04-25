import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';

export function currentUserChecker(connection: Connection): (action: Action) => Promise<User | undefined> {

    return async function innerCurrentUserChecker(action: Action): Promise<User | undefined> {

        const userRepository = connection.getCustomRepository<UserRepository>(UserRepository);
        let user = await userRepository.findByAuth0(action.request.user.sub);
        if (!user) {
            const newUser = new User();
            newUser.username = action.request.user.nickname;
            newUser.email = action.request.user.email;
            newUser.auth0 = action.request.user.sub;
            user = await userRepository.save(newUser);
        }

        return user;

    };
}
