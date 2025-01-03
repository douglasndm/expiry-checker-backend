import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

import Team from './Team';

@Entity('team_subscriptions')
class TeamSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Team, team => team.subscriptions)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column({ name: 'expire_in' })
    expireIn: Date;

    @Column({ name: 'members_limit' })
    membersLimit: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

export default TeamSubscription;
