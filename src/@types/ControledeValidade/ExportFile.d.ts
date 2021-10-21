interface CVLote {
    id: number;
    lote: string;
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
    lotes: Array<CVLote>;
}

interface CVCategory {
    id: string;
    name: string;
}

interface ICVBrand {
    id: string;
    name: string;
}
