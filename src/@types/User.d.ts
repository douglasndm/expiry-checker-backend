interface IUser {
	id: string;
	firebaseUid: string;
	name: string | null;
	lastName: string | null;
	email: string;

	teamId: string | null;
	device: IUserDevice | null;

	createdAt: Date;
	updatedAt: Date;
}
