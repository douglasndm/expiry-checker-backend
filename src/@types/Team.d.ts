interface ITeam {
	id: string;
	name: string;

	useStripe?: boolean;
	defaultStripePackage?: string;

	createdAt: Date;
	updatedAt: Date;
}
