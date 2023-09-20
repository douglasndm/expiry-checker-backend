import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Brand from '@models/Brand';

import AppError from '@errors/AppError';

import { getUserRoleInTeam } from './UserRoles';
import { getTeamById } from './Team/Find';

export async function getAllBrands({
    team_id,
}: getAllBrandsProps): Promise<Brand[]> {
    const cache = new Cache();

    const teamBrandsCache = await cache.get<Brand[]>(`team_brands:${team_id}`);

    if (teamBrandsCache) {
        return teamBrandsCache;
    }

    const brandRepository = getRepository(Brand);

    const brands = await brandRepository
        .createQueryBuilder('brand')
        .where('brand.team_id = :team_id', { team_id })
        .select(['brand.id', 'brand.name'])
        .getMany();

    await cache.save(`team_brands:${team_id}`, brands);

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

    const cache = new Cache();
    await cache.invalidade(`team_brands:${team_id}`);

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

    const cache = new Cache();
    await cache.invalidade(`team_brands:${brand.team.id}`);

    return updatedBrand;
}

export async function createManyBrands({
    brands,
    team_id,
    user_id,
}: createManyBrandsProps): Promise<createManyBrandsResponse> {
    const brandRepository = getRepository(Brand);

    const userRole = await getUserRoleInTeam({
        user_id,
        team_id,
    });

    if (userRole !== 'manager' && userRole !== 'supervisor') {
        throw new AppError({
            message: "You don't have authorization",
            internalErrorCode: 2,
        });
    }

    const team = await getTeamById(team_id);
    const allBrands = await getAllBrands({ team_id });

    const brandsToCreate = brands.filter(brand => {
        const exists = allBrands.find(
            b => b.name.toLowerCase() === brand.name.toLowerCase(),
        );

        if (exists) {
            return false;
        }

        return true;
    });

    const willCreate = brandsToCreate.map(brand => {
        const newBrand = new Brand();
        newBrand.name = brand.name;
        newBrand.team = team;

        return newBrand;
    });

    const createdBrands = await brandRepository.save(willCreate);

    const response = createdBrands.map(brand => {
        const old_id = brands.find(b => b.name === brand.name);

        return {
            old_id: old_id?.id,
            name: brand.name,
            id: brand.id,
        };
    });

    const cache = new Cache();
    await cache.invalidade(`team_brands:${team_id}`);

    return {
        brands: response,
    };
}
