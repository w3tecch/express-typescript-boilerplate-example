import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { env } from '../env';

@Service()
export class AuthService {

    private jwtRequestHandler: jwt.RequestHandler;

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) {
        this.jwtRequestHandler = jwt({
            secret: jwksRsa.expressJwtSecret({
                cache: env.auth.cache,
                rateLimit: env.auth.rateLimit,
                jwksRequestsPerMinute: env.auth.jwksRequestsPerMinute,
                jwksUri: env.auth.jwksUri,
            }),
            issuer: env.auth.issuer,
            algorithms: env.auth.algorithms,
        });
    }

    public jwtCheck(request: express.Request, response: express.Response): Promise<Error | undefined> {
        return new Promise((resolve, reject) => this.jwtRequestHandler(request, response, resolve));
    }

    public simulateJwtCheckForTest(request: express.Request): boolean {
        const getToken = (req: express.Request): string | undefined => {
            const authorization = req.header('authorization');
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                return authorization.split(' ')[1];
            }
            return undefined;
        };

        const token = getToken(request);
        if (token) {
            request.user = new User();
            request.user.sub = token;
            return true;
        }
        return false;
    }

    public parseBasicAuthFromRequest(req: express.Request): { username: string, password: string } {
        const authorization = req.header('authorization');

        // Retrieve the token form the Authorization header
        if (authorization && authorization.split(' ')[0] === 'Basic') {
            this.log.info('Token provided by the client');
            const decodedToken = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            const username = decodedToken.split(':')[0];
            const password = decodedToken.split(':')[1];
            return { username, password };
        }

        this.log.info('No Token provided by the client');
        return undefined;
    }

    public async validateUser(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                username,
                password,
            },
        });
        if (user) {
            return user;
        }
        throw new Error('Invalid credentials');
    }

}
