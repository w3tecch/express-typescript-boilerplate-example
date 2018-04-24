import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { User } from '../api/models/User';
import { env } from '../env';
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

        if (env.isTest) {
            const getToken = (req: express.Request): string | undefined => {
                const authorization = req.header('authorization');
                if (authorization && authorization.split(' ')[0] === 'Bearer') {
                    return authorization.split(' ')[1];
                }
                return undefined;
            };

            const token = getToken(action.request);
            action.request.user = new User();
            action.request.user.sub = token;
            return true;
        }

        const check = () => {
            return new Promise((resolve, reject) => {
                checkJwt(action.request, action.response, resolve);
            });
        };

        const result = await check();
        if (result && (result as any).message) {
            log.warn((result as any).message);
        }
        return !result;

    };
}
