interface BaseAppBatch {
    id: number;
    name: string;
    exp_date: string;
    amount: number;
    price: number;
    price_tmp?: number;
    status: 'Tratado' | 'Não tratado';
    created_at?: string;
    updated_at?: string;
}

interface BaseAppProduct {
    id: number;
    name: string;
    code?: string;
    daysToBeNext?: number;
    photo?: string;
    brand?: string;
    category?: string;
    store?: string;
    created_at?: string;
    updated_at?: string;
    batches: Array<BaseAppBatch>;
}

interface BaseAppCategory {
    id: string;
    name: string;
}

interface IBaseAppBrand {
    id: string;
    name: string;
}

interface IBaseAppStore {
    id: string;
    name: string;
}
