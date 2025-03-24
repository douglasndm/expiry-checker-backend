import api from './config';

interface IResponse {
	ean: 'string';
	ean_tipo: 'string';
	cest: 'string';
	ncm: number;
	nome: 'string';
	nome_acento: 'string';
	unid_abr: 'string';
	unid_desc: 'string';
	marca: 'string';
	pais: 'string';
	categoria: 'string';
	dh_update: 'string';
	link_foto: 'string';
}

async function getProduct(GTIN: string): Promise<IResponse> {
	const response = await api.get<IResponse>(`/api/gtin/infor/${GTIN}`);

	return response.data;
}

export { getProduct };
