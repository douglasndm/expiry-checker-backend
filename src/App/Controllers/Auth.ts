import { Request, Response } from 'express';

import { login } from '@utils/Auth/Login';

class AuthController {
    async store(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        const loggedUser = await login({ email, password });

        return res.status(201).json(loggedUser);
    }
}

export default new AuthController();
