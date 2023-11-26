import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class changingUserIdOnUsersTeams1700722453178
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'users_teams',
            'user_id',
            'firebase_uid',
        );

        await queryRunner.addColumn(
            'users_teams',
            new TableColumn({
                name: 'user_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        const usersTeams = await queryRunner.query(
            `SELECT id, firebase_uid FROM users_teams`,
        );

        for await (const userTeam of usersTeams) { // eslint-disable-line
            const users = await queryRunner.query(
                'SELECT id FROM users WHERE firebase_uid = $1',
                [userTeam.firebase_uid],
            );

            if (users.length > 0) {
                await queryRunner.query(
                    'UPDATE users_teams SET user_id = $1 WHERE firebase_uid = $2',
                    [users[0].id, userTeam.firebase_uid],
                );
            }
        }

        await queryRunner.createForeignKey(
            'users_teams',
            new TableForeignKey({
                name: 'user_id',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.changeColumn(
            'users_teams',
            'user_id',
            new TableColumn({
                name: 'user_id',
                type: 'uuid',
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_teams', 'user_id');

        await queryRunner.dropColumn('users_teams', 'user_id');

        await queryRunner.renameColumn(
            'users_teams',
            'firebase_uid',
            'user_id',
        );
    }
}
