import { getRepository } from 'typeorm';
import { endOfDay, parseISO } from 'date-fns';

import Cache from '@services/Cache';

import Product from '@models/Product';
import Batch from '@models/Batch';
import ProductCategory from '@models/ProductCategory';

import { createManyBrands } from '@utils/Brands/CreateMany';
import { createManyCategories } from '@utils/Categories/CreateMany';
import { createManyStores } from '@utils/Stores/CreateMany';
import { getAllBrands } from '@utils/Brand';
import { getAllCategoriesFromTeam } from '@utils/Categories/List';
import { getAllStoresFromTeam } from '@utils/Stores/List';
import { getTeamById } from '@utils/Team/Find';
import { createManyProducts } from '@utils/Product/CreateMany';

interface IBackupFile {
    brands: IBaseAppBrand[];
    categories: BaseAppCategory[];
    stores: IBaseAppStore[];
    products: BaseAppProduct[];
}

async function importProducts(
    backupFile: IBackupFile,
    team_id: string,
): Promise<void> {
    const { brands, categories, stores, products } = backupFile;

    const brandsNames = brands.map(b => b.name);
    const categoriesNames = categories.map(c => c.name);
    const storesNames = stores.map(s => s.name);

    // this will create the missing brands, categories and stores
    // but if the team already had brands, categories and stores, it will not create the same again
    // so its import to not use the return array of created objects
    // its better to get all brands, categories and stores from team again to make sure all of them are there
    await createManyBrands({
        brands_names: brandsNames,
        team_id,
    });
    await createManyCategories({
        categories_names: categoriesNames,
        team_id,
    });
    await createManyStores({
        stores_names: storesNames,
        team_id,
    });

    const brandsFromTeam = await getAllBrands({ team_id });
    const categoriesFromTeam = await getAllCategoriesFromTeam({ team_id });
    const storesFromTeam = await getAllStoresFromTeam({ team_id });

    const team = await getTeamById(team_id);

    const productsToCreate = products.map(prod => {
        const product = new Product();
        product.name = prod.name;
        product.code = prod.code || null;

        if (prod.brand) {
            const oldBrand = brands.find(b => b.id === prod.brand);

            if (oldBrand) {
                const newBrand = brandsFromTeam.find(
                    b => b.name.toLowerCase() === oldBrand.name.toLowerCase(),
                );

                if (newBrand) {
                    product.brand = newBrand;
                }
            }
        }

        if (prod.category) {
            const oldCategory = categories.find(c => c.id === prod.category);

            if (oldCategory) {
                const newCategory = categoriesFromTeam.find(
                    c =>
                        c.name.toLowerCase() === oldCategory.name.toLowerCase(),
                );

                if (newCategory) {
                    const productCategory = new ProductCategory();
                    productCategory.product = product;
                    productCategory.category = newCategory;

                    product.category = productCategory;
                }
            }
        }

        if (prod.store) {
            const oldStore = stores.find(s => s.id === prod.store);

            if (oldStore) {
                const newStore = storesFromTeam.find(
                    s => s.name.toLowerCase() === oldStore.name.toLowerCase(),
                );

                if (newStore) {
                    product.store = newStore;
                }
            }
        }

        product.batches = prod.batches.map(batch => {
            const newBatch = new Batch();

            const date = String(new Date());
            const status =
                batch.status.toLowerCase() === 'tratado'
                    ? 'checked'
                    : 'unchecked';

            newBatch.name = batch.name;
            newBatch.exp_date = endOfDay(parseISO(batch.exp_date));
            newBatch.amount = batch.amount;
            newBatch.status = status;
            newBatch.price = batch.price;
            newBatch.price_tmp = batch.price_tmp || null;
            newBatch.product = product;
            newBatch.created_at = parseISO(batch.created_at || date);
            newBatch.updated_at = parseISO(batch.updated_at || date);

            return newBatch;
        });

        return product;
    });

    const productRepository = getRepository(Product);
    await productRepository.save(productsToCreate);

    await createManyProducts({
        products: productsToCreate,
        team_id,
    });

    const cache = new Cache();
    await cache.invalidadeTeamCache(team_id);
}

export { importProducts };
