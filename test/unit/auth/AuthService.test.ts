import { Request } from 'express';
import * as MockExpressRequest from 'mock-express-request';
import * as nock from 'nock';
import * as request from 'request';

import { AuthService } from '../../../src/auth/AuthService';
import { env } from '../../../src/env';
import { LogMock } from '../lib/LogMock';

describe('AuthService', () => {

    let authService: AuthService;
    let log: LogMock;
    beforeEach(() => {
        log = new LogMock();
        authService = new AuthService(request, log);
    });

    describe('parseTokenFromRequest', () => {
        test('Should return the token without Bearer', () => {
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: 'Bearer 1234',
                },
            });
            const token = authService.parseTokenFromRequest(req);
            expect(token).toBe('1234');
        });

        test('Should return undefined if there is no Bearer', () => {
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: 'Basic 1234',
                },
            });
            const token = authService.parseTokenFromRequest(req);
            expect(token).toBeUndefined();
            expect(log.infoMock).toBeCalledWith('No Token provided by the client', []);
        });

        test('Should return undefined if there is no "Authorization" header', () => {
            const req: Request = new MockExpressRequest();
            const token = authService.parseTokenFromRequest(req);
            expect(token).toBeUndefined();
            expect(log.infoMock).toBeCalledWith('No Token provided by the client', []);
        });
    });

    describe('getUserInfo', () => {
        test('Should get the userInfo', async (done) => {
            nock(env.auth.route)
                .post('')
                .reply(200, {
                    user_id: 'auth0|test@test.com',
                });

            const userInfo = await authService.getUserInfo('1234');
            expect(userInfo.sub).toBe('auth0|test@test.com');
            done();
        });

        test('Should fail due to invalid token', async (done) => {
            nock(env.auth.route)
                .post('')
                .reply(401, 'Invalid token');

            try {
                await authService.getUserInfo('1234');
            } catch (error) {
                expect(error).toBe('Invalid token');
            }
            done();
        });
    });

});
