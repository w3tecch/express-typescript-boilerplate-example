import * as Faker from 'faker';

import { User } from '../../../src/api/models/User';
import { define } from '../../lib/seed';

define(User, (faker: typeof Faker, settings: { role: string }) => {
    const gender = faker.random.number(1);
    const firstName = faker.name.firstName(gender);
    const lastName = faker.name.lastName(gender);
    const username = faker.internet.userName(firstName, lastName);
    const email = faker.internet.email(firstName, lastName);
    const password = faker.lorem.word();

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.username = username;
    user.password = password;
    return user;
});
