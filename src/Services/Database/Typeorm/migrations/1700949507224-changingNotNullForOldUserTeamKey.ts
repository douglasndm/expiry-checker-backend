import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class changingNotNullForOldUserTeamKey1700949507224
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users_teams',
            'firebase_uid',
            new TableColumn({
                name: 'firebase_uid',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users_teams',
            'firebase_uid',
            new TableColumn({
                name: 'firebase_uid',
                type: 'varchar',
                isNullable: false,
            }),
        );
    }
}
