import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import User from '@models/User';
import Store from '@models/Store';

@Entity({ name: 'users_stores' })
class UserStores {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.roles)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Store, store => store.users)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserStores;
