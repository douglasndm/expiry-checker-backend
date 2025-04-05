interface IUser {
	id: string;
	firebaseUid: string;
	name: string | null;
	lastName: string | null;
	email: string;

	createdAt: Date;
	updatedAt: Date;
}
