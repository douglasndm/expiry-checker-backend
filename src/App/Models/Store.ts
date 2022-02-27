import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import UsersStores from '@models/UsersStores';
import Team from '@models/Team';

@Entity({ name: 'stores' })
class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => Team, team => team.subscriptions)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @OneToMany(() => UsersStores, usersStores => usersStores.user)
    users: Array<UsersStores>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default Store;
