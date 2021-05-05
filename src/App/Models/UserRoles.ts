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
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(type => Team, team => team.users, { eager: true })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column()
    role: string;
}

export default UserRoles;
