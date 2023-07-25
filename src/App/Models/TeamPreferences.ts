import {
    CreateDateColumn,
    Entity,
    Column,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import Team from './Team';

@Entity('teams_preferences')
class TeamPreferences {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'days_product_next_expire' })
    daysToBeNext: number;

    @OneToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

export default TeamPreferences;
