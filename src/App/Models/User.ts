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

    @OneToOne(() => UserDevice)
    device: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
