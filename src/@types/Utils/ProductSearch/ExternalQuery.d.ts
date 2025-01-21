interface BluesoftResponse {
    avg_price: number;
    brand: {
        name: string;
        picture: string;
    };
    description: string;
    gpc: {
        code: string;
        description: string;
    };
    gross_weight: number;
    gtin: number;
    height: number;
    length: number;
    max_price: number;
    ncm: {
        code: string;
        description: string;
        full_description: string;
    };
    net_weight: number;
    price: string;
    thumbnail: string;
    width: number;
}

interface BrasilAPIResponse {
    message?: string;
    return?: {
        nome: string;
        descricao: null;
        gtin: null;
        ean: string;
        imagem_produto: string;
        peso_liquido: string;
        peso_bruto: string;
        imagem_codigo_barras: string;
        marca_nome: string;
        imagem_marca: string;
        tipo_embalagem: string;
        quantidade_embalagem: string;
        base_origem: string;
        data_criacao: string;
        data_atualizacao: string;
    };
}

interface findProductByEANExternalResponse {
    name: string;
    code: string;
    brand?: string;
    thumbnail: string | null;
}
