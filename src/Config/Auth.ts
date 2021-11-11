import dotenv from 'dotenv';

dotenv.config();

export default {
    secret: process.env.AUTH_SECRET || '',
    expiresIn: '1d',
};
