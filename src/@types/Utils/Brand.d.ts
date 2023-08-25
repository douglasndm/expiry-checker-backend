interface getAllBrandsProps {
    team_id: string;
}

interface createBrandProps {
    name: string;
    team_id: string;
    user_id: string;
}

interface updateBrandProps {
    brand_id: string;
    user_id: string;
    name: string;
}

interface deleteBrandProps {
    brand_id: string;
    user_id: string;
}

interface getAllProductsFromBrand {
    brand_id: string;
    team_id: string;
}

interface createManyBrandsProps {
    brands: ICVBrand[];
    team_id: string;
    user_id: string;
}

interface createManyBrandsResponse {
    brands: {
        id: string;
        name: string;
        old_id?: string;
    }[];
}
