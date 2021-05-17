import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Team } from './Team';
import { User } from './User';

@Entity({ name: 'users_team_relationship' })
class UserRoles {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.roles)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'firebaseUid' })
    user: User;

    @ManyToOne(type => Team, team => team.users)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column()
    role: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default UserRoles;
