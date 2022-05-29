import { createUser } from '@utils/User/Create';
import {
    getUserByFirebaseId,
    getUserById,
    getUserByEmail,
} from '@utils/User/Find';

import AppError from '@errors/AppError';

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

    // EXPECT ERRORS
    it('should NOT find an user by firebase id', async () => {
        try {
            await getUserByFirebaseId('123');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.errorCode).toBe(7);
            }
        }
    });

    it('should NOT find an user by id', async () => {
        try {
            await getUserById('08792baf-8264-4b1e-bd09-af922815e803');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.errorCode).toBe(7);
            }
        }
    });

    it('should NOT find an user by email', async () => {
        try {
            await getUserByEmail('invalid@mail.com');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.errorCode).toBe(7);
            }
        }
    });
});
