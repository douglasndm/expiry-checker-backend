import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Team } from './Team';
import UserRoles from './UserRoles';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { name: 'firebase_uid' })
    firebaseUid: string;

    @Column('varchar')
    name: string;

    @Column('varchar', { name: 'last_name' })
    lastName: string;

    @Column('varchar')
    email: string;

    @Column('varchar')
    password: string;

    @OneToMany(type => UserRoles, userRoles => userRoles.user)
    roles: Array<UserRoles>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
