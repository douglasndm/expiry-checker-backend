interface getAllUsersFromStoreProps {
	store_id: string;
}

interface getAllUsersFromStoreResponse {
	id: string;
	name?: string | null;
	lastName?: string | null;
	firebaseUid: string;
	email: string;
	password?: string | null;
	role: UserRole;
	created_at: Date;
	updated_at: Date;
}

interface getAllStoresFromUserProps {
	user_id: string;
}

interface getAllStoresFromUserResponse {
	store: Store;
	team_id: string;
}

interface addUserToStoreProps {
	user_id: string;
	store_id: string;
}

interface removeUserFromStoreProps {
	user_id: string;
	store_id: string;
}
