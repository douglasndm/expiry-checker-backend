import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { Product } from '../Models/Product';

import { checkIfUserHasAccessToAProduct } from '../../Functions/UserAccessProduct';
import { getAllUsersByTeam } from '../../Functions/Teams';
import { checkIfProductAlreadyExists } from '../../Functions/Products';

class ProductController {
    async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        try {
            const userHasAccessToProduct = await checkIfUserHasAccessToAProduct(
                {
                    product_id: id,
                    user_id: req.userId,
                },
            );

            if (!userHasAccessToProduct) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do that' });
            }

            const reposity = getRepository(Product);

            const product = await reposity.findOne({
                where: { id },
                relations: ['batches'],
            });

            return res.status(200).json(product);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const schema = Yup.object().shape({
                name: Yup.string().required(),
                code: Yup.string(),
                team_id: Yup.string().required().uuid(),
            });

            if (!(await schema.isValid(req.body))) {
                return res
                    .status(400)
                    .json({ error: 'Check the info provider' });
            }

            const { name, code, team_id } = req.body;

            const usersInTeam = await getAllUsersByTeam({ team_id });

            const isUserInTeam = usersInTeam.filter(ut => ut.id === req.userId);

            if (isUserInTeam.length <= 0) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            const productAlreadyExists = await checkIfProductAlreadyExists({
                name,
                code,
                team_id,
            });

            if (productAlreadyExists) {
                return res.status(400).json({
                    error: 'This product already exists. Try add a new batch',
                });
            }

            const prod: Product = new Product();
            prod.name = name;
            prod.code = code;

            const repository = getRepository(Product);

            const response = await repository.save(prod);

            return res.status(201).json(response);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaParams = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        const schema = Yup.object().shape({
            name: Yup.string(),
            code: Yup.string(),
        });

        if (
            !(await schema.isValid(req.body)) ||
            !(await schemaParams.isValid(req.params))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { product_id } = req.params;
            const { name, code } = req.body;

            const userHasAccessToProduct = await checkIfUserHasAccessToAProduct(
                {
                    product_id,
                    user_id: req.userId,
                },
            );

            if (!userHasAccessToProduct) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do that' });
            }

            const productRepository = getRepository(Product);

            const product = await productRepository.findOne(product_id);

            if (!product) {
                return res.status(400).json({ error: 'Product not found' });
            }

            product.name = name;
            product.code = code;

            const updatedProduct = await productRepository.save(product);

            return res.status(200).json(updatedProduct);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new ProductController();
