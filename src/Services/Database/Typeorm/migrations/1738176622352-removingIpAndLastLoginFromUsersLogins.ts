import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemovingIpAndLastLoginFromUsersLogins1738176622352
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumns('users_logins', [
			'ip_address',
			'last_login',
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumns('users_logins', [
			new TableColumn({
				name: 'ip_address',
				type: 'varchar',
				isNullable: true,
			}),
			new TableColumn({
				name: 'last_login',
				type: 'timestamp',
				default: 'now()',
			}),
		]);
	}
}
