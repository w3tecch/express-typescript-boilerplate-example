import * as express from 'express';
import * as request from 'request';
import { Require, Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { env } from '../env';
import { UserInfoInterface } from './UserInfoInterface';

@Service()
export class AuthService {

    private httpRequest: typeof request;

    constructor(
        @Require('request') r: any,
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) {
        this.httpRequest = r;
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

    public parseTokenFromRequest(req: express.Request): string | undefined {
        const authorization = req.header('authorization');

        // Retrieve the token form the Authorization header
        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            this.log.info('Token provided by the client');
            return authorization.split(' ')[1];
        }

        this.log.info('No Token provided by the client');
        return undefined;
    }

    public getUserInfo(accessToken: string): Promise<UserInfoInterface> {
        return new Promise((resolve, reject) => {
            this.httpRequest({
                method: 'GET',
                url: env.auth.route,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }, (error: any, response: request.RequestResponse, body: any) => {
                // Verify if the requests was successful and append user
                // information to our extended express request object
                if (!error) {
                    if (response.statusCode === 200) {
                        const userInfo = JSON.parse(body);
                        return resolve(userInfo);
                    }
                    return reject(body);
                }
                return reject(error);
            });
        });
    }

}
