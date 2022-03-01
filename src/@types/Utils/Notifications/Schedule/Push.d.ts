interface UserToNotificate {
    id: string;
    store_id?: string;
    device_id?: string;
}

interface StoreToNotificate {
    id: string;
    name?: string;
    expiredBatches?: number;
    nextExpBatches?: number;
    users: UserToNotificate[];
}

interface NoStoreToNotificate {
    expiredBatches?: number;
    nextExpBatches?: number;
    users: UserToNotificate[];
}

interface TeamToNotificate {
    team_id: string;
    stores: StoreToNotificate[];
    noStore: NoStoreToNotificate;
}
