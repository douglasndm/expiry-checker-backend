import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addingAppVersionTable1646963248549 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'apps_version',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'app_package',
                        type: 'varchar',
                    },
                    {
                        name: 'latest_android_version',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'latest_ios_version',
                        type: 'int',
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('apps_version');
    }
}
