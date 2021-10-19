import { getRepository } from 'typeorm';

import Product from '@models/Product';
import Brand from '@models/Brand';

import { getTeam } from '@functions/Team';

import AppError from '@errors/AppError';

import { getUserRoleInTeam } from './UserRoles';

export async function getAllBrands({
    team_id,
}: getAllBrandsProps): Promise<Brand[]> {
    const brandRepository = getRepository(Brand);

    const brands = await brandRepository
        .createQueryBuilder('brand')
        .where('brand.team_id = :team_id', { team_id })
        .getMany();

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

    const team = await getTeam({ team_id });

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
    return updatedBrand;
}

export async function deleteBrand({
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

    await brandRepository.remove(brand);
}

export async function getAllProductsFromBrand({
    brand_id,
}: getAllProductsFromBrand): Promise<Product[]> {
    const productRepository = getRepository(Product);

    const products = await productRepository
        .createQueryBuilder('prod')
        .where('prod.brand = :brand_id', { brand_id })
        .getMany();

    return products;
}
