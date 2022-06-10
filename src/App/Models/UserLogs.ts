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

@Entity({ name: 'users_logs' })
class UserLogin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, user => user.logs)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @OneToOne(() => Team, team => team.logs)
    @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
    team: Team;

    @Column({ name: 'target' })
    target: string;

    @Column({ name: 'target_id' })
    target_id?: string;

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

export default UserLogin;
