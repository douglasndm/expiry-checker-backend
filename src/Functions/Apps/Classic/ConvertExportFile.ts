import { getRepository } from 'typeorm';
import { startOfDay, parseISO } from 'date-fns';

import { getTeamById } from '@utils/Team/Find';
import { createManyBrands, getAllBrands } from '@utils/Brand';

import Product from '@models/Product';
import Batch from '@models/Batch';
import Team from '@models/Team';
import ProductTeams from '@models/ProductTeams';
import Category from '@models/Category';
import ProductCategory from '@models/ProductCategory';

import { OldToNewCategories } from './Categories';

interface convertExportFileProps {
    oldProducts: Array<CVProduct>;
    team_id: string;
    user_id: string;
    categories?: Array<OldToNewCategories>;
    brands: Array<ICVBrand>;
}

export async function convertExportFile({
    oldProducts,
    team_id,
    user_id,
    categories,
    brands,
}: convertExportFileProps): Promise<Array<Product>> {
    const teamRepository = getRepository(Team);
    const productRepository = getRepository(Product);
    const batchRepository = getRepository(Batch);
    const prodTeamRepository = getRepository(ProductTeams);
    const categoryRepository = getRepository(Category);
    const productCategoryRepo = getRepository(ProductCategory);

    const team = getTeamById(team_id);

    const newCategoriesUUID: Array<string> = [];

    let categoriesInTeam: Array<Category> = [];

    if (categories && categories.length > 0) {
        categories.forEach(cat => newCategoriesUUID.push(cat.newId));

        categoriesInTeam = await categoryRepository
            .createQueryBuilder('cate')
            .where('cate.id IN(:...cats)', { cats: newCategoriesUUID })
            .getMany();
    }

    const brandsResponse = await createManyBrands({
        brands,
        team_id,
        user_id,
    });

    const allBrands = await getAllBrands({ team_id });

    const products: Array<Product> = [];
    const prodTeam: Array<ProductTeams> = [];
    const batc: Array<Batch> = [];

    const prodInCats: Array<ProductCategory> = [];

    oldProducts.forEach(prod => {
        const product = productRepository.create();
        product.name = prod.name;
        product.code = prod.code || '';

        if (prod.brand) {
            const brandToAdd = allBrands.find(brand => {
                const oldBrand = brandsResponse.brands.find(b => {
                    if (b.old_id === prod.brand) {
                        if (brand.name.toLowerCase() === b.name.toLowerCase()) {
                            return true;
                        }
                    }

                    return false;
                });

                if (oldBrand) return true;
                return false;
            });

            if (brandToAdd) product.brand = brandToAdd;
        }

        const batches: Array<Batch> = [];

        prod.batches.forEach(bat => {
            const batch = batchRepository.create();
            batch.name = bat.name;
            batch.exp_date = startOfDay(parseISO(bat.exp_date));
            batch.amount = bat.amount;
            batch.price = bat.price;
            batch.status =
                bat.status.toLowerCase() === 'tratado'
                    ? 'checked'
                    : 'unchecked';
            batch.product = product;

            batches.push(batch);
            batc.push(batch);
        });

        const prodCategories: Array<Category> = [];

        prod.categories.forEach(oldCat => {
            const categoryReference = categories?.find(
                cat => cat.oldId === oldCat,
            );

            const categoryToAddProduct = categoriesInTeam.find(
                cat => cat.id === categoryReference?.newId,
            );

            if (categoryToAddProduct) {
                prodCategories.push(categoryToAddProduct);
            }
        });

        prodCategories.forEach(prodCat => {
            const productInCategory = new ProductCategory();
            productInCategory.product = product;
            productInCategory.category = prodCat;

            prodInCats.push(productInCategory);
        });

        const productInTeam = prodTeamRepository.create();
        productInTeam.product = product;
        productInTeam.team = team;

        products.push(product);
        prodTeam.push(productInTeam);
    });

    const savedProducts = await productRepository.save(products);
    await prodTeamRepository.save(prodTeam);
    await productCategoryRepo.save(prodInCats);
    await batchRepository.save(batc);

    return savedProducts;
}
