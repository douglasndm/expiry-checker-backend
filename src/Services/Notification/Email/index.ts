import { defaultDataSource } from '@services/TypeORM';

import NotificationsPreferences from '@models/NotificationsPreferences';

interface userEmailResponse {
    id: string;
    email: string;
}

export async function getAllUsersIDAllowedToSendEmail(): Promise<
    userEmailResponse[]
> {
    const notificationsPreferences = defaultDataSource.getRepository(
        NotificationsPreferences,
    );

    const allPreferences = await notificationsPreferences
        .createQueryBuilder('noti')
        .leftJoinAndSelect('noti.user', 'user')
        .where('noti.email_enabled = true')
        .getMany();

    const users: userEmailResponse[] = allPreferences.map(preferences => {
        return {
            id: preferences.user.id,
            email: preferences.user.email,
        };
    });

    return users;
}
