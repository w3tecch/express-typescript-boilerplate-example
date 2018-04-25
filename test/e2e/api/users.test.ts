import * as nock from 'nock';
import * as request from 'supertest';

import { User } from '../../../src/api/models/User';
import { CreateBruce } from '../../../src/database/seeds/CreateBruce';
import { runSeed } from '../../../src/lib/seed';
import { closeDatabase } from '../../utils/database';
import { BootstrapSettings } from '../utils/bootstrap';
import { prepareServer } from '../utils/server';

describe('/api/users', () => {

    let bruce: User;
    let settings: BootstrapSettings;

    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    beforeAll(async () => {
        settings = await prepareServer({ migrate: true });
        bruce = await runSeed<User>(CreateBruce);
    });

    // -------------------------------------------------------------------------
    // Tear down
    // -------------------------------------------------------------------------

    afterAll(async () => {
        nock.cleanAll();
        await closeDatabase(settings.connection);
    });

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('GET: / should return a list of users', async (done) => {
        const response = await request(settings.app)
            .get('/api/users')
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.length).toBe(1);
        done();
    });

    test('GET: /:id should return bruce', async (done) => {
        const response = await request(settings.app)
            .get(`/api/users/${bruce.id}`)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBe(bruce.id);
        expect(response.body.username).toBe(bruce.username);
        expect(response.body.email).toBe(bruce.email);
        done();
    });

    test('GET: /me/tasks should return all tasks of bruce', async (done) => {
        const response = await request(settings.app)
            .get(`/api/users/me/tasks`)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.length).toBe(bruce.tasks.length);
        expect(response.body[0].id).toBe(bruce.tasks[0].id);
        done();
    });

});
