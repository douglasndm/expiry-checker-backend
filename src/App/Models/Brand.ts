import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

import Team from '@models/Team';

@Entity({ name: 'brands' })
export default class Brand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @ManyToOne(() => Team, team => team.brands)
    @JoinColumn({ name: 'team_id' })
    team?: Team;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
