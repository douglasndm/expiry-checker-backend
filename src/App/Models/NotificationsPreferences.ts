import {
    Entity,
    Column,
    OneToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

import User from './User';

@Entity({ name: 'notifications_preferences' })
export default class NotificationsPreferences {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('bool')
    email_enabled?: boolean;

    @Column('timestamp')
    email_change_date?: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
