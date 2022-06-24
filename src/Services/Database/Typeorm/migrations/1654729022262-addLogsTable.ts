import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class addLogsTable1654729022262 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users_logs',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'team_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'target',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'target_id',
                        type: 'uuid',
                        isNullable: true, // If it a delete of a product for example
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'new_value',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'old_value',
                        type: 'varchar',
                        isNullable: true,
                    },

                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
        );

        await queryRunner.createForeignKey(
            'users_logs',
            new TableForeignKey({
                name: 'user_id',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'users_logs',
            new TableForeignKey({
                name: 'team_id',
                columnNames: ['team_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'teams',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_logs', 'user_id');
        await queryRunner.dropForeignKey('users_logs', 'team_id');
        await queryRunner.dropTable('users_logs');
    }
}
