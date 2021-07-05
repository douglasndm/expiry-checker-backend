import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import Team from './Team';

@Entity({ name: 'categories' })
export default class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @ManyToOne(() => Team, team => team.categories)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
