import { getRepository } from 'typeorm';
import axios from 'axios';
import { startOfDay, parseISO, compareAsc } from 'date-fns';

import { Team } from '../../App/Models/Team';
import TeamSubscription from '../../App/Models/TeamSubscription';

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
        .getOne();

    return response || null;
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
        throw new Error('Team was not found');
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
        membersLimit: 1 | 3 | 5 | 10 | 15;
    }

    const revenueSubscriptions: Array<revenueSubscriptionsProps> = [];

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

    const pendingsSubs = revenueSubscriptions.filter(cat => {
        const cat_exp_date = startOfDay(cat.expires_date);

        if (!subscription) {
            return false;
        }

        const back_exp_date = startOfDay(subscription.expireIn);

        if (compareAsc(cat_exp_date, back_exp_date) === 0) {
            if (cat.membersLimit === subscription.membersLimit) {
                return true;
            }
            return false;
        }

        return false;
    });

    if (pendingsSubs.length > 0) {
        const date = startOfDay(pendingsSubs[0].expires_date);

        await createSubscription({
            team_id,
            exp_date: date,
            members_limit: pendingsSubs[0].membersLimit,
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
