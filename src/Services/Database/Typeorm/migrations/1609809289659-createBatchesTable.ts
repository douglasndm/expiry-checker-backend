import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class createBatchesTable1609809289659 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'batches',
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
                        name: 'exp_date',
                        type: 'timestamp',
                    },
                    {
                        name: 'amount',
                        type: 'integer',
                    },
                    {
                        name: 'price',
                        type: 'money',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                    },
                    {
                        name: 'product_id',
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
            'batches',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('batches', 'product_id');
        await queryRunner.dropTable('batches');
    }
}
