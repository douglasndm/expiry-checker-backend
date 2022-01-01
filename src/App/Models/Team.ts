import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Brand from './Brand';

import Category from './Category';
import ProductTeams from './ProductTeams';
import TeamSubscription from './TeamSubscription';
import UserRoles from './UserRoles';

@Entity({ name: 'teams' })
export default class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name?: string;

    @OneToMany(() => Category, category => category.team)
    categories: Array<Category>;

    @OneToMany(() => UserRoles, userRoles => userRoles.user)
    users: Array<UserRoles>;

    @OneToMany(() => ProductTeams, productTeams => productTeams.team)
    products: Array<ProductTeams>;

    @OneToMany(() => Brand, brand => brand.team)
    brands: Array<Brand>;

    @OneToMany(() => TeamSubscription, subscriptions => subscriptions.team)
    subscriptions: Array<TeamSubscription>;

    @Column({ name: 'subs_last_time_checked' })
    lastTimeChecked: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
