import { getRepository } from 'typeorm';

import ProductTeams from '@models/ProductTeams';

interface checkIfProductAlreadyExistsProps {
    name: string;
    code?: string;
    team_id: string;
}

export async function checkIfProductAlreadyExists({
    name,
    code,
    team_id,
}: checkIfProductAlreadyExistsProps): Promise<boolean> {
    const productTeamRepository = getRepository(ProductTeams);

    const products = await productTeamRepository
        .createQueryBuilder('prods')
        .leftJoinAndSelect('prods.product', 'product')
        .leftJoinAndSelect('prods.team', 'team')
        .where('product.name = :product_name', { product_name: name })
        .andWhere('team.id = :team_id', { team_id })
        .getMany();

    const productExists = products.filter(p => {
        if (code) {
            if (p.product.code !== code) {
                return false;
            }
            return true;
        }

        return true;
    });

    return productExists.length > 0;
}
