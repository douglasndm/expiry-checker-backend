interface IProductSuggestion {
	id: string;
	brand: string | null;
	code: string;
	name: string;
	image: string | null;

	data_from?: string;
	ncm?: number;
	country?: string;

	created_at: Date;
	updated_at: Date;
}
