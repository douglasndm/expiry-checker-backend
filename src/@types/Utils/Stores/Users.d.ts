interface getAllUsersFromStoreProps {
    store_id: string;
}

interface getAllUsersFromStoreResponse {
    stores: Store[];
    id: string;
    name?: string | undefined;
    lastName?: string | undefined;
    firebaseUid: string;
    email: string;
    password?: string | undefined;
    roles: UserRoles[];
    device: string;
    created_at: Date;
    updated_at: Date;
}

interface getAllStoresFromUserProps {
    user_id: string;
}

interface addUserToStoreProps {
    user_id: string;
    store_id: string;
}

interface removeUserFromStoreProps {
    user_id: string;
    store_id: string;
}
