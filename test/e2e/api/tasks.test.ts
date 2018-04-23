import * as nock from 'nock';
import * as request from 'supertest';

import { User } from '../../../src/api/models/User';
import { CreateBruce } from '../../../src/database/seeds/CreateBruce';
import { CreateUsers } from '../../../src/database/seeds/CreateUsers';
import { runSeed } from '../../../src/lib/seed';
import { closeDatabase } from '../../utils/database';
import { BootstrapSettings } from '../utils/bootstrap';
import { prepareServer } from '../utils/server';

describe('/api/tasks', () => {

    let bruce: User;
    let otherUsers: User[];
    let settings: BootstrapSettings;

    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    beforeAll(async () => {
        settings = await prepareServer({ migrate: true });
        bruce = await runSeed<User>(CreateBruce);
        otherUsers = await runSeed<User[]>(CreateUsers);
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

    test('POST: / should create a new task for bruce', async (done) => {
        const newTaskTitle = 'newTaskTitle';
        const newTask = {
            title: newTaskTitle,
        };
        const response = await request(settings.app)
            .post(`/api/tasks`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBeDefined();
        expect(response.body.title).toBe(newTaskTitle);
        expect(response.body.isCompleted).toBeFalsy();
        done();
    });

    test('PUT: / should update the task', async (done) => {
        const newTaskTitle = 'newTaskTitle';
        const newTask = Object.assign({}, bruce.tasks[0], {
            title: newTaskTitle,
        });
        const response = await request(settings.app)
            .put(`/api/tasks/${bruce.tasks[0].id}`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBe(bruce.tasks[0].id);
        expect(response.body.title).toBe(newTaskTitle);
        done();
    });

    test('PUT: / should return 403 if the current user is not the owner of the task', async (done) => {
        const task = otherUsers[0].tasks[0];
        const newTaskTitle = 'newTaskTitle';
        const newTask = Object.assign({}, task, {
            title: newTaskTitle,
        });
        await request(settings.app)
            .put(`/api/tasks/${task.id}`)
            .send(newTask)
            .set('Authorization', `Basic ${bruce.toBase64()}`)
            .expect('Content-Type', /json/)
            .expect(403);

        done();
    });

});
