import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import User from '@models/User';

@Entity({ name: 'users_device' })
class UserDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.device)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'firebaseUid' })
    user: User;

    @Column()
    device_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserDevice;
