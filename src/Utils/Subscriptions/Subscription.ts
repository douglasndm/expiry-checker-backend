import { compareAsc, parseISO, endOfDay } from 'date-fns';

import TeamSubscription from '@models/TeamSubscription';

import { getTeamAdmin } from '@utils/UserRoles';

import AppError from '@errors/AppError';

import { getExternalSubscription } from './External';
import { getTeamSubscription } from './Team';
import { setTeamSubscription } from './Update';

function handleMembersLimit(
    subscription: IRevenueCatSubscription,
): IRevenueCatSubscription {
    let members = 0;

    switch (subscription.name) {
        case 'expirybusiness_monthly_default_1person':
            members = 1;
            break;
        case 'expirybusiness_monthly_default_2people':
            members = 2;
            break;
        case 'expirybusiness_monthly_default_3people':
            members = 3;
            break;
        case 'expirybusiness_monthly_default_5people':
            members = 5;
            break;
        case 'expirybusiness_monthly_default_10people':
            members = 10;
            break;
        case 'expirybusiness_monthly_default_15people':
            members = 15;
            break;
        case 'expiryteams_monthly_default_30people':
            members = 30;
            break;
        case 'expiryteams_monthly_default_45people':
            members = 45;
            break;
        case 'expiryteams_monthly_default_60people':
            members = 60;
            break;
        default:
            members = 0;
            break;
    }

    return {
        ...subscription,
        members,
    };
}

// return true while expired
function checkExpiredSubscription(expire_date: Date): boolean {
    const date = endOfDay(expire_date);
    const today = endOfDay(new Date());

    const compare = compareAsc(date, today);

    if (compare >= 0) {
        return false;
    }

    return true;
}

async function getSubscription(team_id: string): Promise<TeamSubscription> {
    let teamSubscription: TeamSubscription | null = null;

    teamSubscription = await getTeamSubscription({ team_id });

    let isExpired = true;

    if (teamSubscription) {
        isExpired = checkExpiredSubscription(teamSubscription.expireIn);
    }

    if (!teamSubscription || isExpired) {
        let externalSubscription = await getExternalSubscription(team_id);

        // Check if subscriptions object is empty for TEAM ID, if true
        // check for subscription for the manager id
        if (externalSubscription.length <= 0) {
            const teamAdmin = await getTeamAdmin(team_id);

            externalSubscription = await getExternalSubscription(
                teamAdmin.firebaseUid,
            );
        }

        if (externalSubscription.length > 0) {
            // sort subscriptions by exp date
            const sortedSubscriptions = externalSubscription.sort(
                (sub1, sub2) => {
                    const date1 = endOfDay(
                        parseISO(sub1.subscription.expires_date),
                    );
                    const date2 = endOfDay(
                        parseISO(sub2.subscription.expires_date),
                    );

                    if (compareAsc(date1, date2) < 0) {
                        return 1;
                    }
                    if (compareAsc(date1, date2) === 0) {
                        return 0;
                    }
                    return -1;
                },
            );

            const sub = handleMembersLimit(sortedSubscriptions[0]);

            const savedSubscription = await setTeamSubscription({
                team_id,
                subscription: sub.subscription,
                members: sub.members || 0,
            });

            isExpired = checkExpiredSubscription(
                parseISO(sub.subscription.expires_date),
            );

            if (!isExpired) {
                return savedSubscription;
            }
        }

        throw new AppError({
            statusCode: 429,
            message: "Team or admin doesn't have an active subscription",
            internalErrorCode: 5,
        });
    }

    if (isExpired) {
        throw new AppError({
            statusCode: 429,
            message: "Team or admin doesn't have an active subscription",
            internalErrorCode: 5,
        });
    }

    return teamSubscription;
}

export { getSubscription };
