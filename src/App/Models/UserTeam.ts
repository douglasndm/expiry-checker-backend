import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import Team from './Team';
import User from './User';

@Entity({ name: 'users_teams' })
class UserTeam {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, user => user.role)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Team, team => team.users)
	@JoinColumn({ name: 'team_id' })
	team: Team;

	@Column()
	role: string;

	@Column({ name: 'enter_code', type: 'varchar', nullable: true })
	code: string | null;

	@Column({ type: 'varchar', nullable: true })
	status: string | null;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

export default UserTeam;
