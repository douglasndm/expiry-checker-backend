import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import UserRoles from './UserRoles';
import UsersStores from './UsersStores';
import UserLogin from './UserLogin';

@Entity({ name: 'users' })
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name?: string;

    @Column({ name: 'last_name' })
    lastName?: string;

    @Column('varchar', { name: 'firebase_uid' })
    firebaseUid: string;

    @Column('varchar')
    email: string;

    @Column()
    password?: string;

    @OneToMany(() => UserRoles, userRoles => userRoles.user)
    roles: Array<UserRoles>;

    @OneToMany(() => UsersStores, usersStores => usersStores.user)
    stores: Array<UsersStores>;

    @OneToOne(() => UserLogin, userLogin => userLogin.user)
    login: UserLogin;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
