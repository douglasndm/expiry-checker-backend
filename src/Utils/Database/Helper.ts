import { getRepository } from 'typeorm';

import ProductRequest from '@models/ProductRequest';
import ProductDetails from '@models/ProductDetails';

export interface IJSON {
    codbar: string;
    produto_upper: string;
    marca: string;
    foto_png: string;
}

async function addProductIfNotExists(data: IJSON): Promise<void> {
    const { codbar, produto_upper, marca, foto_png } = data;

    const requestRepository = getRepository(ProductRequest);

    const request = await requestRepository
        .createQueryBuilder('request')
        .where('request.code = :code', { code: codbar.trim() })
        .getOne();

    if (request) {
        await requestRepository.remove(request);
    }

    const productRepository = getRepository(ProductDetails);
    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code = :code', { code: `${codbar.trim()}` })
        .getOne();

    if (!product) {
        console.log(`Adding ${codbar.trim()}`);

        const prod = new ProductDetails();
        prod.code = codbar.trim();
        prod.name = produto_upper;
        prod.dataFrom = 'local';

        if (foto_png.trim() !== '') {
            prod.thumbnail = codbar.trim();
        }

        if (marca.trim() !== '') {
            prod.brand = marca;
        }

        await productRepository.save(prod);
    }
}

export { addProductIfNotExists };
