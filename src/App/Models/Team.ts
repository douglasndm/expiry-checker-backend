import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from './Category';
import ProductTeams from './ProductTeams';

import UserRoles from './UserRoles';

@Entity({ name: 'teams' })
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @OneToMany(() => Category, category => category.team)
    categories: Array<Category>;

    // @ManyToMany(() => User, user => user.teams)
    // users: Array<User>;

    @OneToMany(type => UserRoles, userRoles => userRoles.user)
    users: Array<UserRoles>;

    @OneToMany(type => ProductTeams, productTeams => productTeams.team)
    products: Array<ProductTeams>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
