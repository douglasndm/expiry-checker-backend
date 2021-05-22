import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class addTeamSubscriptionsTable1621638760365
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'team_subscriptions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'team_id',
                        type: 'uuid',
                    },
                    {
                        name: 'expire_in',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'members_limit',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        isNullable: false,
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
            'team_subscriptions',
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
        await queryRunner.dropTable('team_subscriptions');
    }
}
