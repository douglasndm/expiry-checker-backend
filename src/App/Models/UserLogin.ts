import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import User from './User';

@Entity({ name: 'users_logins' })
class UserLogin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, user => user.login)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @Column({ name: 'device_id' })
    deviceId: string;

    @Column({ name: 'ip_address' })
    ipAddress?: string;

    @Column({ name: 'last_login' })
    lastLogin: Date;

    @Column({ name: 'firebase_messaging' })
    firebaseMessagingToken?: string;

    @Column({ name: 'onesignal_token' })
    oneSignalToken?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserLogin;
