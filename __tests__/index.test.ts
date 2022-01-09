import request from 'supertest';

import app from '../src/app';

describe('Teste 01', () => {
    it('should get main route', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
