import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { env } from '../env';
import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: any[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {

        if (env.isTest) {
            return authService.simulateJwtCheckForTest(action.request);
        }

        const jwtError = await authService.jwtCheck(action.request, action.response);
        if (jwtError && jwtError.message) {
            log.warn(jwtError.message);
            return false;
        }
        return true;

    };
}
