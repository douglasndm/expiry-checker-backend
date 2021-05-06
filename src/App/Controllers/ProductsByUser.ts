import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '../Models/User';
import { Product } from '../Models/Product';

class ProductByUserController {
    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req;

            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            const userRepository = getRepository(User);
            const productRepository = getRepository(Product);

            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['roles'],
            });

            return res.status(200).send(user);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new ProductByUserController();
