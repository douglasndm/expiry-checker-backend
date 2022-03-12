import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductDetails from '@models/ProductDetails';

import AppError from '@errors/AppError';

interface findProductByEANProps {
    code: string;
}

async function findProductByEAN({
    code,
}: findProductByEANProps): Promise<ProductDetails[]> {
    const schema = Yup.object().shape({
        code: Yup.string().required(),
    });

    try {
        await schema.validate({ code });
    } catch (err) {
        throw new AppError({ message: 'Invalid product code' });
    }

    const productRepository = getRepository(ProductDetails);

    const products = await productRepository
        .createQueryBuilder('product')
        .where('product.code like :code', { code: `%${code}%` })
        .getMany();

    return products;
}

export { findProductByEAN };
