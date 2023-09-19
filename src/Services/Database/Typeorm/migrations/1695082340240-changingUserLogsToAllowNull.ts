import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class changingUserLogsToAllowNull1695082340240
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users_logs',
            'user_id',
            new TableColumn({
                name: 'user_id',
                type: 'uuid',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users_logs',
            'user_id',
            new TableColumn({
                name: 'user_id',
                type: 'uuid',
                isNullable: false,
            }),
        );
    }
}
