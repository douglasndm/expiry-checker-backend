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
import Team from './Team';
import Product from './Product';
import Batch from './Batch';
import Category from './Category';

@Entity({ name: 'users_logs' })
class UserLogs {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, user => user.logs)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @OneToOne(() => Team, team => team.logs)
    @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
    team: Team;

    @OneToOne(() => Product, product => product.logs)
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product?: Product;

    @OneToOne(() => Batch, batch => batch.logs)
    @JoinColumn({ name: 'batch_id', referencedColumnName: 'id' })
    batch?: Batch;

    @OneToOne(() => Category, category => category.logs)
    @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
    category?: Category;

    @Column({ name: 'action' })
    action: string;

    @Column({ name: 'new_value' })
    new_value?: string;

    @Column({ name: 'old_value' })
    old_value?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserLogs;
