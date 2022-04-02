import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import { getUserByEmail } from '@utils/User/Find';

import AppError from '@errors/AppError';

interface ILoginRequest {
    email: string;
    password: string;
}

interface ILoginResponse {
    token: string;
}

async function login({
    email,
    password,
}: ILoginRequest): Promise<ILoginResponse> {
    const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
    });

    try {
        await schema.validate({ email, password });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({ message: err.message });
        }
    }

    const user = await getUserByEmail(email);

    if (!user.password) {
        throw new AppError({
            message: 'User does not have a password',
            internalErrorCode: 28,
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new AppError({
            message: 'Email or password are not valid',
            internalErrorCode: 29,
        });
    }

    const userInfo = {
        id: user.id,
        email: user.email,
    };

    const token = jwt.sign(
        { user: userInfo },
        process.env.AUTH_TOKEN_SECRET || '',
        {
            expiresIn: '1d',
        },
    );

    return { token };
}

export { login };
