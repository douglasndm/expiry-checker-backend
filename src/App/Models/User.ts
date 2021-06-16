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
import UserDevice from './UserDevice';

@Entity({ name: 'users' })
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { name: 'firebase_uid' })
    firebaseUid: string;

    @Column('varchar')
    name: string | null;

    @Column('varchar', { name: 'last_name' })
    lastName: string | null;

    @Column('varchar')
    email: string;

    @Column('varchar')
    password: string;

    @OneToMany(type => UserRoles, userRoles => userRoles.user)
    roles: Array<UserRoles>;

    @OneToOne(() => UserDevice)
    device: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
