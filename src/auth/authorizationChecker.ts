import * as jwt from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { Logger } from '../lib/logger';

export function authorizationChecker(connection: Connection): (action: Action, roles: any[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);

    const checkJwt = jwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: 'https://qta.eu.auth0.com/.well-known/jwks.json',
        }),
        issuer: 'https://qta.eu.auth0.com/',
        algorithms: ['RS256'],
    });

    return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {

        const check = () => {
            return new Promise((resolve, reject) => {
                checkJwt(action.request, action.response, resolve);
            });
        };

        const result = await check();
        if (result && (result as any).message)  {
            log.warn((result as any).message);
        }
        return !result;

    };
}
