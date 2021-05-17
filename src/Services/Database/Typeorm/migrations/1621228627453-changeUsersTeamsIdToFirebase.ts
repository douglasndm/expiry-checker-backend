import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class changeUsersTeamsIdToFirebase1621228627453
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'users_team_relationship',
            'FK_351b5b8387668e5c5055dea91c6',
        );

        await queryRunner.changeColumn(
            'users_team_relationship',
            'user_id',
            new TableColumn({
                name: 'user_id',
                type: 'varchar',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'users_team_relationship',
            new TableForeignKey({
                name: 'user_id',
                columnNames: ['user_id'],
                referencedColumnNames: ['firebase_uid'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_team_relationship', 'user_id');

        await queryRunner.changeColumn(
            'users_team_relationship',
            'user_id',
            new TableColumn({
                name: 'user_id',
                type: 'uuid',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'users_team_relationship',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }
}
