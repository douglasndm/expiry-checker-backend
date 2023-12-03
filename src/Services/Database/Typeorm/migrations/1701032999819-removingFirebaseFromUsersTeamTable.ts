import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class removingFirebaseFromUsersTeamTable1701032999819
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users_teams', 'firebase_uid');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users_teams',
            new TableColumn({
                name: 'firebase_uid',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }
}
