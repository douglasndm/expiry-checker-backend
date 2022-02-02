import axios from 'axios';
import { parseISO, compareAsc, startOfDay } from 'date-fns';

import TeamSubscription from '@models/TeamSubscription';

import AppError from '@errors/AppError';

import { createSubscription } from '@functions/Subscriptions';
import { getTeamAdmin } from './UserRoles';
import { getAllSubscriptionsFromTeam } from './Team';

export async function getExternalSubscriptionStatus(id: string): Promise<any> {
    const api = axios.create({
        headers: {
            Authorization: process.env.REVENUECAT_API_KEY,
        },
    });

    const response = await api.get(
        `https://api.revenuecat.com/v1/subscribers/${id}`,
    );

    return response.data;
}

async function checkAndSaveTeamSubscription({
    team_id,
    revenuecatSubscriptions,
}: checkAndSaveTeamSubscriptionProps) {
    const { subscriptions: subs } = revenuecatSubscriptions.subscriber;

    const revenueSubscriptions: Array<revenueSubscriptionsProps> = [];

    // #region adiciona cada uma das assinaturas no array
    if (subs.expiryteams_monthly_default_60people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expiryteams_monthly_default_60people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 60,
        });
    }
    if (subs.expiryteams_monthly_default_45people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expiryteams_monthly_default_45people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 45,
        });
    }
    if (subs.expiryteams_monthly_default_30people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expiryteams_monthly_default_30people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 30,
        });
    }
    if (subs.expirybusiness_monthly_default_15people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_15people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 15,
        });
    }
    if (subs.expirybusiness_monthly_default_10people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_10people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 10,
        });
    }
    if (subs.expirybusiness_monthly_default_5people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_5people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 5,
        });
    }
    if (subs.expirybusiness_monthly_default_3people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_3people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 3,
        });
    }
    if (subs.expirybusiness_monthly_default_2people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_2people;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 2,
        });
    }
    if (subs.expirybusiness_monthly_default_1person) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_1person;

        revenueSubscriptions.push({
            expires_date: parseISO(expires_date),
            purchase_date: parseISO(purchase_date),
            membersLimit: 1,
        });
    }
    // #endregion

    // sort subscriptions by exp date
    const sortedRevenueSubs = revenueSubscriptions.sort((sub1, sub2) => {
        if (compareAsc(sub1.purchase_date, sub2.purchase_date) < 0) {
            return 1;
        }
        if (compareAsc(sub1.purchase_date, sub2.purchase_date) === 0) {
            return 0;
        }
        return -1;
    });

    const currentSubscriptions = await getAllSubscriptionsFromTeam(team_id);

    const alreadyExists = currentSubscriptions.some(sub => {
        const date1 = startOfDay(sub.expireIn);
        const date2 = startOfDay(sortedRevenueSubs[0].expires_date);

        if (compareAsc(date1, date2) === 0) return true;
        return false;
    });

    if (!alreadyExists) {
        await createSubscription({
            team_id,
            exp_date: startOfDay(sortedRevenueSubs[0].expires_date),
            members_limit: sortedRevenueSubs[0].membersLimit,
        });
    }
}

export async function getTeamSubscription(
    team_id: string,
): Promise<TeamSubscription> {
    const subscriptions = await getAllSubscriptionsFromTeam(team_id);

    const validSubs = subscriptions.filter(
        sub => startOfDay(sub.expireIn) >= startOfDay(new Date()),
    );

    if (validSubs.length > 0) {
        const sortedSubs = validSubs.sort((sub1, sub2) =>
            compareAsc(sub1.expireIn, sub2.expireIn),
        );
        return sortedSubs[0];
    }

    const teamSubscription = await getExternalSubscriptionStatus(team_id);

    let subscriptionToCheck = teamSubscription;

    // Check if subscriptions object is empty for TEAM ID, if true
    // check for subscription for the manager id
    if (Object.keys(teamSubscription.subscriber.subscriptions).length <= 0) {
        const teamAdmin = await getTeamAdmin(team_id);

        const adminSubscription = await getExternalSubscriptionStatus(
            teamAdmin.firebaseUid,
        );

        if (
            Object.keys(adminSubscription.subscriber.subscriptions).length <= 0
        ) {
            throw new AppError({
                message: "Team or admin doesn't have an active subscription",
                internalErrorCode: 5,
            });
        }

        subscriptionToCheck = adminSubscription;
    }

    await checkAndSaveTeamSubscription({
        team_id,
        revenuecatSubscriptions: subscriptionToCheck,
    });

    const recheckSubs = await getAllSubscriptionsFromTeam(team_id);
    const recheckValidSubs = recheckSubs.filter(
        sub => startOfDay(sub.expireIn) >= startOfDay(new Date()),
    );

    if (recheckValidSubs.length <= 0) {
        throw new AppError({
            message: "Team or admin doesn't have an active subscription",
            internalErrorCode: 5,
        });
    }

    const sortedSubs = recheckValidSubs.sort((sub1, sub2) =>
        compareAsc(sub1.expireIn, sub2.expireIn),
    );
    return sortedSubs[0];
}
