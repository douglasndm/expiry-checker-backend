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

interface findProductByEANExternalResponse {
	name: string;
	code: string;
	brand?: string;
	thumbnail: string | null;
}
