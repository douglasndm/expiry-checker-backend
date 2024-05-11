import { getRepository } from 'typeorm';

import {
    getFromCache,
    saveOnCache,
    invalidadeCache,
} from '@services/Cache/Redis';

import Brand from '@models/Brand';

import AppError from '@errors/AppError';

import { getUserRoleInTeam } from './UserRoles';
import { getTeamById } from './Team/Find';

export async function getAllBrands({
    team_id,
}: getAllBrandsProps): Promise<Brand[]> {
    const teamBrandsCache = await getFromCache<Brand[]>(
        `team_brands:${team_id}`,
    );

    if (teamBrandsCache) {
        return teamBrandsCache;
    }

    const brandRepository = getRepository(Brand);

    const brands = await brandRepository
        .createQueryBuilder('brand')
        .where('brand.team_id = :team_id', { team_id })
        .select(['brand.id', 'brand.name'])
        .getMany();

    await saveOnCache(`team_brands:${team_id}`, brands);

    return brands;
}

export async function createBrand({
    name,
    team_id,
    user_id,
}: createBrandProps): Promise<Brand> {
    // This will throw an error if user is not in the team
    await getUserRoleInTeam({
        user_id,
        team_id,
    });

    const team = await getTeamById(team_id);

    const brandRepository = getRepository(Brand);

    const alreadyExists = await brandRepository
        .createQueryBuilder('brand')
        .where('brand.team_id = :team_id', { team_id })
        .andWhere('LOWER(brand.name) = LOWER(:name)', { name })
        .getOne();

    if (alreadyExists) {
        throw new AppError({
            message: 'Brand already exists',
            internalErrorCode: 31,
        });
    }

    const brand = new Brand();
    brand.name = name.trim();
    brand.team = team;

    const createdBrand = await brandRepository.save(brand);

    await invalidadeCache(`team_brands:${team_id}`);

    return createdBrand;
}

export async function updateBrand({
    brand_id,
    user_id,
    name,
}: updateBrandProps): Promise<Brand> {
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

    brand.name = name;

    const updatedBrand = await brandRepository.save(brand);

    await invalidadeCache(`team_brands:${brand.team.id}`);

    return updatedBrand;
}
