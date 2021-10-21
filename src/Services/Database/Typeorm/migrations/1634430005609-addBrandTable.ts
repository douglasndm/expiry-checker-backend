import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class addBrandTable1634430005609 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'brands',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        name: 'team_id',
                        type: 'uuid',
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
            'brands',
            new TableForeignKey({
                columnNames: ['team_id'],
                referencedTableName: 'teams',
                referencedColumnNames: ['id'],
            }),
        );

        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'brand_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['brand_id'],
                referencedTableName: 'brands',
                referencedColumnNames: ['id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('products', 'brand_id');
        await queryRunner.dropColumn('products', 'brand_id');
        await queryRunner.dropForeignKey('brands', 'team_id');
        await queryRunner.dropTable('brands');
    }
}
