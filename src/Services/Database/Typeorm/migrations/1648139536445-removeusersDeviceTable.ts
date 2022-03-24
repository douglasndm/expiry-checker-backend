import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class removeusersDeviceTable1648139536445 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_device', 'user_id');
        await queryRunner.dropTable('users_device');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users_device',
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
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'device_id',
                        type: 'varchar',
                        isUnique: true,
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
            'users_device',
            new TableForeignKey({
                name: 'user_id',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['firebase_uid'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }
}
