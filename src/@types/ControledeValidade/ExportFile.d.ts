interface CVBatch {
    id: number;
    name: string;
    exp_date: string;
    amount: number;
    price: number;
    status: 'Tratado' | 'Não tratado';
}

interface CVProduct {
    id: number;
    name: string;
    code?: string;
    brand?: string;
    photo?: string;
    store?: string;
    categories: Array<string>;
    batches: Array<CVBatch>;
}

interface CVCategory {
    id: string;
    name: string;
}

interface ICVBrand {
    id: string;
    name: string;
}
