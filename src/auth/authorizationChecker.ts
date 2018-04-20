import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: any[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {
        // here you can use request/response objects from action
        // also if decorator defines roles it needs to access the action
        // you can use them to provide granular access check
        // checker must return either boolean (true or false)
        // either promise that resolves a boolean value
        // demo code:
        const credentials = authService.parseBasicAuthFromRequest(action.request);

        if (!credentials) {
            log.warn('No accessToken given');
            return false;
        }

        // Request user info at auth0 with the provided accessToken
        try {
            action.request.user = await authService.validateUser(credentials.username, credentials.password);
            log.info('Successfully checked token');
            return true;
        } catch (e) {
            log.warn(e);
            return false;
        }
    };
}
