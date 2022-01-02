import { getRepository } from 'typeorm';
import { startOfDay, compareAsc } from 'date-fns';

import Team from '@models/Team';
import TeamSubscription from '@models/TeamSubscription';

import { getExternalSubscriptionStatus } from '@utils/Subscription';
import { getTeamAdmin } from '@utils/UserRoles';

import AppError from '@errors/AppError';

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

interface recheckResponse {
    name: string;
    subscription: RevenueCatSubscription;
}

export async function recheckTemp(id: string): Promise<recheckResponse[]> {
    const response = await getExternalSubscriptionStatus(id);
    const { subscriptions: subs } = response.subscriber;

    const subscriptions = subs;

    const allSubscription: Array<recheckResponse> = [];

    if (subscriptions.expirybusiness_monthly_default_15people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_15people',
            subscription: subscriptions.expirybusiness_monthly_default_15people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_10people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_10people',
            subscription: subscriptions.expirybusiness_monthly_default_10people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_5people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_5people',
            subscription: subscriptions.expirybusiness_monthly_default_5people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_3people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_3people',
            subscription: subscriptions.expirybusiness_monthly_default_3people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_2people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_2people',
            subscription: subscriptions.expirybusiness_monthly_default_2people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_1person) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_1person',
            subscription: subscriptions.expirybusiness_monthly_default_1person,
        });
    }

    const teamAdmin = await getTeamAdmin(id);
    const adminSubscription = await getExternalSubscriptionStatus(
        teamAdmin.firebaseUid,
    );

    const adminSub = adminSubscription.subscriber.subscriptions;

    if (adminSub.expirybusiness_monthly_default_15people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_15people',
            subscription: adminSub.expirybusiness_monthly_default_15people,
        });
    }
    if (adminSub.expirybusiness_monthly_default_10people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_10people',
            subscription: adminSub.expirybusiness_monthly_default_10people,
        });
    }
    if (adminSub.expirybusiness_monthly_default_5people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_5people',
            subscription: adminSub.expirybusiness_monthly_default_5people,
        });
    }
    if (adminSub.expirybusiness_monthly_default_3people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_3people',
            subscription: adminSub.expirybusiness_monthly_default_3people,
        });
    }
    if (adminSub.expirybusiness_monthly_default_2people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_2people',
            subscription: adminSub.expirybusiness_monthly_default_2people,
        });
    }
    if (adminSub.expirybusiness_monthly_default_1person) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_1person',
            subscription: adminSub.expirybusiness_monthly_default_1person,
        });
    }
    return allSubscription;
}
