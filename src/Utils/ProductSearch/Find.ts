import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductDetails from '@models/ProductDetails';

import BackgroundJob from '@services/Background';

import AppError from '@errors/AppError';

interface findProductByEANProps {
    code: string;
}

async function findProductByEAN({
    code,
}: findProductByEANProps): Promise<ProductDetails | null> {
    const schema = Yup.object().shape({
        code: Yup.string().required().min(8),
    });

    try {
        await schema.validate({ code });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({ message: err.message });
        }
    }

    const queryWithoutLetters = code.replace(/\D/g, '');
    const query = queryWithoutLetters.replace(/^0+/, ''); // Remove zero on begin

    const productRepository = getRepository(ProductDetails);
    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code = :code', { code: `${query}` })
        .getOne();

    if (!product) {
        await BackgroundJob.add('FindProductByCodeExternal', { code: query });
    }

    return product || null;
}

export { findProductByEAN };
