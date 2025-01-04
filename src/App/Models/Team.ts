import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Brand from './Brand';

import Category from './Category';
import Store from './Store';
import TeamSubscription from './TeamSubscription';
import UserLogs from './UserLogs';
import UserTeam from './UserTeam';
import Product from './Product';

@Entity({ name: 'teams' })
export default class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name?: string;

    @OneToMany(() => Category, category => category.team)
    categories: Array<Category>;

    @OneToMany(() => UserTeam, userTeam => userTeam.user)
    users: Array<UserTeam>;

    @OneToMany(() => Product, product => product.team)
    products: Array<Product>;

    @OneToMany(() => Brand, brand => brand.team)
    brands: Array<Brand>;

    @OneToMany(() => Store, store => store.team)
    stores: Array<Store>;

    @OneToMany(() => TeamSubscription, subscriptions => subscriptions.team)
    subscriptions: Array<TeamSubscription>;

    @OneToMany(() => UserLogs, userLogs => userLogs.team)
    logs: Array<UserLogs>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
