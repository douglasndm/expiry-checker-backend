import { getRepository } from 'typeorm';

import Brand from '@models/Brand';

import { getTeam } from '@functions/Team';

import AppError from '@errors/AppError';

export async function createBrand({
    name,
    team_id,
}: createBrandProps): Promise<Brand> {
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
