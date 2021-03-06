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
import Product from '@models/Product';

@Entity({ name: 'stores' })
class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => Team, team => team.stores)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @OneToMany(() => UsersStores, usersStores => usersStores.user)
    users: Array<UsersStores>;

    @OneToMany(() => Product, product => product.store)
    products: Array<Product>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default Store;
