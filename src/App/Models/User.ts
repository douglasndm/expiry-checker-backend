import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import UserTeam from './UserTeam';
import UserStore from './UsersStores';
import UserLogin from './UserLogin';
import UserLogs from './UserLogs';

@Entity({ name: 'users' })
export default class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'name', type: 'varchar', nullable: true })
	name: string | null;

	@Column({ name: 'last_name', type: 'varchar', nullable: true })
	lastName: string | null;

	@Column('varchar', { name: 'firebase_uid' })
	firebaseUid: string;

	@Column('varchar')
	email: string;

	@Column({ name: 'password', type: 'varchar', nullable: true })
	password: string | null;

	@OneToOne(() => UserTeam, userTeam => userTeam.user)
	role: UserTeam;

	@OneToOne(() => UserStore, userStore => userStore.user)
	store: UserStore;

	@OneToOne(() => UserLogin, userLogin => userLogin.user)
	login: UserLogin;

	@OneToMany(() => UserLogs, userLogs => userLogs.user)
	logs: Array<UserLogs>;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
