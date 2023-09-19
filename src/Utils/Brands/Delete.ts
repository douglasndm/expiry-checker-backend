import { getRepository } from 'typeorm';

import Product from '@models/Product';
import Brand from '@models/Brand';

import Cache from '@services/Cache';

import AppError from '@errors/AppError';

import { getUserRoleInTeam } from '../UserRoles';

async function deleteBrand({
    brand_id,
    user_id,
}: deleteBrandProps): Promise<void> {
    const brandRepository = getRepository(Brand);

    const brand = await brandRepository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.team', 'team')
        .where('brand.id = :brand_id', { brand_id })
        .getOne();

    if (!brand) {
        throw new AppError({
            message: 'Brand not found',
            internalErrorCode: 32,
        });
    }
    if (!brand.team) {
        throw new AppError({
            message: 'Team not found',
            internalErrorCode: 6,
        });
    }

    const userRole = await getUserRoleInTeam({
        user_id,
        team_id: brand.team.id,
    });

    if (userRole !== 'manager' && userRole !== 'supervisor') {
        throw new AppError({
            message: "You don't have authorization",
            internalErrorCode: 2,
        });
    }

    const produtsInBrandRepository = getRepository(Product);
    const produtsInBrand = await produtsInBrandRepository
        .createQueryBuilder('prod')
        .leftJoinAndSelect('prod.brand', 'brand')
        .where('brand.id = :brand_id', { brand_id })
        .getMany();

    const updatedProds = produtsInBrand.map(prod => {
        return {
            ...prod,
            brand: null,
        };
    });

    await produtsInBrandRepository.save(updatedProds);

    await brandRepository.remove(brand);

    const cache = new Cache();
    await cache.invalidade(`team_products:${brand.team.id}`);
    await cache.invalidade(`team_brands:${brand.team.id}`);
}

async function deleteAllBrandsFromTeam(team_id: string): Promise<void> {
    const repository = getRepository(Brand);

    const brands = await repository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await repository.remove(brands);

    const cache = new Cache();
    await cache.invalidadeTeamCache(team_id);
}

export { deleteBrand, deleteAllBrandsFromTeam };
