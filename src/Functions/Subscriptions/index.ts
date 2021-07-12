import { getRepository } from 'typeorm';
import axios from 'axios';
import { startOfDay, parseISO, compareAsc } from 'date-fns';

import AppError from '@errors/AppError';

import Team from '@models/Team';
import TeamSubscription from '@models/TeamSubscription';

interface getTeamSubscriptionProps {
    team_id: string;
}

export async function getTeamSubscription({
    team_id,
}: getTeamSubscriptionProps): Promise<TeamSubscription | null> {
    const repository = getRepository(TeamSubscription);

    const response = await repository
        .createQueryBuilder('subs')
        .leftJoinAndSelect('subs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .orderBy('subs.expireIn', 'DESC')
        .getMany();

    const activeSubs = response.filter(sub => {
        const today = startOfDay(new Date());
        const date = startOfDay(sub.expireIn);

        if (compareAsc(today, date) > 0) {
            return false;
        }
        return true;
    });

    const sortedSubs = activeSubs.sort((sub1, sub2) => {
        if (sub1.membersLimit > sub2.membersLimit) {
            return -1;
        }
        if (sub1.membersLimit < sub2.membersLimit) {
            return 1;
        }
        return 0;
    });

    if (sortedSubs.length > 0) {
        return sortedSubs[0];
    }

    return null;
}

interface createSubscriptionpProps {
    team_id: string;
    exp_date: Date;
    members_limit: number;
}

export async function createSubscription({
    team_id,
    exp_date,
    members_limit,
}: createSubscriptionpProps): Promise<void> {
    const teamSubscriptionRepository = getRepository(TeamSubscription);
    const teamRepository = getRepository(Team);

    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new AppError({
            message: 'Team was not found',
            statusCode: 400,
            internalErrorCode: 6,
        });
    }

    const teamSubscription = new TeamSubscription();
    teamSubscription.team = team;
    teamSubscription.expireIn = exp_date;
    teamSubscription.membersLimit = members_limit;
    teamSubscription.isActive = startOfDay(exp_date) >= startOfDay(new Date());

    await teamSubscriptionRepository.save(teamSubscription);
}

interface checkSubscriptionsProps {
    team_id: string;
    revenuecatSubscriptions: IRevenueCatResponse;
}

export async function checkSubscriptions({
    team_id,
    revenuecatSubscriptions,
}: checkSubscriptionsProps): Promise<void> {
    const { subscriptions: subs } = revenuecatSubscriptions.subscriber;

    const subscription = await getTeamSubscription({ team_id });

    interface revenueSubscriptionsProps {
        expires_date: Date;
        purchase_date: Date;
        membersLimit: 1 | 2 | 3 | 5 | 10 | 15;
    }

    const revenueSubscriptions: Array<revenueSubscriptionsProps> = [];

    // #region
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

    if (subscription && sortedRevenueSubs.length > 0) {
        if (subscription.membersLimit === sortedRevenueSubs[0].membersLimit) {
            const subsciptionDate = startOfDay(subscription.expireIn);
            const revenueDate = startOfDay(sortedRevenueSubs[0].expires_date);

            if (compareAsc(subsciptionDate, revenueDate) === 0) {
                return;
            }
        }
    }

    if (sortedRevenueSubs.length > 0) {
        const date = startOfDay(sortedRevenueSubs[0].expires_date);

        await createSubscription({
            team_id,
            exp_date: date,
            members_limit: sortedRevenueSubs[0].membersLimit,
        });
    }
}

export async function checkSubscriptionOnRevenueCat(
    team_id: string,
): Promise<IRevenueCatResponse> {
    const response = await axios.get<IRevenueCatResponse>(
        `https://api.revenuecat.com/v1/subscribers/${team_id}`,
        {
            headers: {
                Authorization: process.env.REVENUECAT_API_KEY,
            },
        },
    );

    return response.data;
}
