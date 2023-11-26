import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeUserTeamsTableName1700722264917
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('users_team_relationship', 'users_teams');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('users_teams', 'users_team_relationship');
    }
}
