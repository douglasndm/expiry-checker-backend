import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Team from './Team';
import User from './User';

@Entity({ name: 'users_team_relationship' })
class UserRoles {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.roles)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'firebaseUid' })
    user: User;

    @ManyToOne(() => Team, team => team.users)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column()
    role: string;

    @Column({ name: 'enter_code' })
    code: string;

    @Column()
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserRoles;
