import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from './Category';
import { User } from './User';
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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
