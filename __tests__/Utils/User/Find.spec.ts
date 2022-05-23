import { createUser } from '@utils/User/Create';
import {
    getUserByFirebaseId,
    getUserById,
    getUserByEmail,
} from '@utils/User/Find';

import connection from '../../Services/Database';

beforeAll(async () => {
    await connection.create();

    await createUser({
        firebaseUid: '123456789asd',
        name: 'Douglas',
        lastName: 'Mattos',
        email: 'mail@mail.com',
        password: '123456789',
    });
});

afterAll(async () => {
    await connection.close();
});

beforeEach(async () => {
    await connection.clear();
});

describe('Find user process', () => {
    it('should find an user by firebase id', async () => {
        const user = await getUserByFirebaseId('123456789asd');

        expect(user).not.toBe(null);
        expect(user.name).toBe('Douglas');
    });

    it('should find an user by id', async () => {
        // This is for get ID and then search for it
        const user = await getUserByFirebaseId('123456789asd');

        const userById = await getUserById(user.id);

        expect(user).not.toBe(null);
        expect(userById.id).toBe(user.id);
    });

    it('should find an user by email', async () => {
        const user = await getUserByEmail('mail@mail.com');

        expect(user).not.toBe(null);
        expect(user.name).toBe('Douglas');
    });
});
