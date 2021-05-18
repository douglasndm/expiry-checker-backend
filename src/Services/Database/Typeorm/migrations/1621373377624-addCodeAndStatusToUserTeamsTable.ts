import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addCodeAndStatusToUserTeamsTable1621373377624
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users_team_relationship',
            new TableColumn({
                name: 'enter_code',
                type: 'varchar',
                isNullable: true,
                isUnique: false,
            }),
        );
        await queryRunner.addColumn(
            'users_team_relationship',
            new TableColumn({
                name: 'status',
                type: 'varchar',
                isNullable: true,
                isUnique: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users_team_relationship', 'enter_code');
        await queryRunner.dropColumn('users_team_relationship', 'status');
    }
}
