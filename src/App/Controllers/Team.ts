import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import ProductTeams from '../Models/ProductTeams';
import { Team } from '../Models/Team';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        try {
            const { team_id } = req.params;

            const teamRepository = getRepository(Team);
            const productTeamsRepository = getRepository(ProductTeams);

            const team = await teamRepository.findOne(team_id);

            const products = await productTeamsRepository
                .createQueryBuilder('product_teams')
                .select('product_teams.id')
                .where('product_teams.team_id = :id', { id: team_id })
                .leftJoinAndSelect('product_teams.product', 'product')
                .getMany();

            const productsWithoutId = products.map(p => p.product);

            return res.status(200).json({ team, products: productsWithoutId });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new TeamController();
