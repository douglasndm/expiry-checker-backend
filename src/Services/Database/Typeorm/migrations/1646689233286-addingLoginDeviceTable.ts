import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class addingLoginDeviceTable1646689233286 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users_logins',
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
                    },
                    {
                        name: 'device_id',
                        type: 'varchar',
                    },
                    {
                        name: 'ip_address',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'last_login',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'firebase_messaging',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'onesignal_token',
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
            'users_logins',
            new TableForeignKey({
                name: 'user_id',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_logins', 'user_id');
        await queryRunner.dropTable('users_logins');
    }
}
