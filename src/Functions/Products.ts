import { getRepository } from 'typeorm';

import ProductTeams from '../App/Models/ProductTeams';

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

    const teamProducts = await productTeamRepository.find({
        where: {
            team: { id: team_id },
        },
        relations: ['team', 'product'],
    });

    const productExists = teamProducts.filter(p => {
        if (code) {
            if (p.product.code === code) {
                return true;
            }
            return false;
        }

        if (p.product.name === name) {
            return true;
        }

        return false;
    });

    if (productExists.length > 0) {
        return true;
    }
    return false;
}
