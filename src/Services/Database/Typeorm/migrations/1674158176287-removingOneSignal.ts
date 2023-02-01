import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class removingOneSignal1674158176287 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users_logins', 'onesignal_token');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users_logins',
            new TableColumn({
                name: 'onesignal_token',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }
}
