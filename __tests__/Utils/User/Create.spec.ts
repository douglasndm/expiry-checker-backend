import { createUser } from '@utils/User/Create';

import connection from '../../Services/Database';

beforeAll(async () => {
    await connection.create();
});

afterAll(async () => {
    await connection.close();
});

beforeEach(async () => {
    await connection.clear();
});

describe('Create user process', () => {
    it('should create an user', () => {
        return createUser({
            firebaseUid: '123456789asd',
            name: 'Douglas',
            lastName: 'Mattos',
            email: 'mail@mail.com',
            password: '123456789',
        });
    });
});
