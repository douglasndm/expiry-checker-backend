import { getRepository } from 'typeorm';

import { invalidadeCache, invalidadeTeamCache } from '@services/Cache/Redis';

import Product from '@models/Product';
import Brand from '@models/Brand';

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

    await invalidadeCache(`team_products:${brand.team.id}`);
    await invalidadeCache(`team_brands:${brand.team.id}`);
}

async function deleteAllBrandsFromTeam(team_id: string): Promise<void> {
    const repository = getRepository(Brand);

    const brands = await repository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await repository.remove(brands);

    await invalidadeTeamCache(team_id);
}

export { deleteBrand, deleteAllBrandsFromTeam };
