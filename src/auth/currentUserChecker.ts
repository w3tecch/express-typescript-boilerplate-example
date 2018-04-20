import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { User } from '../api/models/User';

// import { Logger } from '../lib/logger';

// import { UserInfoInterface } from './UserInfoInterface';

export function currentUserChecker(connection: Connection): (action: Action) => Promise<User | undefined> {
    // const log = new Logger(__filename);

    return async function innerCurrentUserChecker(action: Action): Promise<User | undefined> {

        return action.request.user;

        // here you can use request/response objects from action
        // you need to provide a user object that will be injected in controller actions
        // demo code:
        // const userInfo: UserInfoInterface = action.request.userInfo;
        // const em = connection.createEntityManager();
        // const user = await em.findOne<User>(User, {
        //     where: {
        //         email: userInfo.sub.replace('auth0|', ''),
        //     },
        // });
        // if (user) {
        //     log.info('Current user is ', user.toString());
        // } else {
        //     log.info('Current user is undefined');
        // }

        // return user;
    };
}
