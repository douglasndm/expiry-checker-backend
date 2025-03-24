interface IProductRequest {
	code: string;
	rank: number;
	notFound?: boolean;
	notFoundOn?: string;

	createdAt: Date;
	updatedAt: Date;
}
