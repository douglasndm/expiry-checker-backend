import { getRepository } from 'typeorm';
import axios from 'axios';
import { startOfDay, parseISO, compareAsc } from 'date-fns';

import { Team } from '../../App/Models/Team';
import TeamSubscription from '../../App/Models/TeamSubscription';

interface getAllSubscriptionsProps {
    team_id: string;
}

export async function getAllSubscriptionsFromTeam({
    team_id,
}: getAllSubscriptionsProps): Promise<Array<TeamSubscription>> {
    const repository = getRepository(TeamSubscription);

    const response = await repository
        .createQueryBuilder('subs')
        .leftJoinAndSelect('subs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return response;
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

    const allSubs = await getAllSubscriptionsFromTeam({ team_id });

    interface SubProps {
        exp_date: string;
        members_limit: number;
    }
    let subToCreate: SubProps | null = null;

    if (subs.expirybusiness_monthly_default_15people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_15people;

        const alreadySub = allSubs.find(sub => {
            if (sub.membersLimit === 15) {
                if (
                    compareAsc(
                        startOfDay(sub.expireIn),
                        startOfDay(parseISO(expires_date)),
                    ) === 0
                ) {
                    return true;
                }
            }
            return false;
        });

        if (!alreadySub) {
            subToCreate = {
                exp_date: expires_date,
                members_limit: 15,
            };
        }
    } else if (subs.expirybusiness_monthly_default_10people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_10people;

        const alreadySub = allSubs.find(sub => {
            if (sub.membersLimit === 10) {
                if (
                    compareAsc(
                        startOfDay(sub.expireIn),
                        startOfDay(parseISO(expires_date)),
                    ) === 0
                ) {
                    return true;
                }
            }
            return false;
        });

        if (!alreadySub) {
            subToCreate = {
                exp_date: expires_date,
                members_limit: 10,
            };
        }
    } else if (subs.expirybusiness_monthly_default_5people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_5people;

        const alreadySub = allSubs.find(sub => {
            if (sub.membersLimit === 5) {
                if (
                    compareAsc(
                        startOfDay(sub.expireIn),
                        startOfDay(parseISO(expires_date)),
                    ) === 0
                ) {
                    return true;
                }
            }
            return false;
        });

        if (!alreadySub) {
            subToCreate = {
                exp_date: expires_date,
                members_limit: 5,
            };
        }
    } else if (subs.expirybusiness_monthly_default_3people) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_3people;

        const alreadySub = allSubs.find(sub => {
            if (sub.membersLimit === 3) {
                if (
                    compareAsc(
                        startOfDay(sub.expireIn),
                        startOfDay(parseISO(expires_date)),
                    ) === 0
                ) {
                    return true;
                }
            }
            return false;
        });

        if (!alreadySub) {
            subToCreate = {
                exp_date: expires_date,
                members_limit: 3,
            };
        }
    } else if (subs.expirybusiness_monthly_default_1person) {
        const {
            expires_date,
            purchase_date,
        } = subs.expirybusiness_monthly_default_1person;

        const alreadySub = allSubs.find(sub => {
            if (sub.membersLimit === 1) {
                if (
                    compareAsc(
                        startOfDay(sub.expireIn),
                        startOfDay(parseISO(expires_date)),
                    ) === 0
                ) {
                    return true;
                }
            }
            return false;
        });

        if (!alreadySub) {
            subToCreate = {
                exp_date: expires_date,
                members_limit: 1,
            };
        }
    }

    if (subToCreate) {
        await createSubscription({
            team_id,
            exp_date: parseISO(subToCreate.exp_date),
            members_limit: subToCreate.members_limit,
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
