import Brand from '@models/Brand';
import Category from '@models/Category';
import Store from '@models/Store';

import { getAllBrands } from '@utils/Brand';
import { getAllCategoriesFromTeam } from '@utils/Categories/List';
import { getAllStoresFromTeam } from '@utils/Stores/List';

interface getExtraInformationsForProduct {
    team_id: string;
}

interface getExtraInformationsForProductResponse {
    availableBrands: Brand[];
    availableCategories: Category[];
    availableStores: Store[];
}

async function getExtraInformationsForProduct({
    team_id,
}: getExtraInformationsForProduct): Promise<getExtraInformationsForProductResponse> {
    const brands = await getAllBrands({ team_id });
    const categories = await getAllCategoriesFromTeam({ team_id });
    const stores = await getAllStoresFromTeam({ team_id });

    return {
        availableBrands: brands,
        availableCategories: categories,
        availableStores: stores,
    };
}

export { getExtraInformationsForProduct };
