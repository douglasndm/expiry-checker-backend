import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class alterBatchesTable1620355379658 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'batches',
            'amount',
            new TableColumn({
                name: 'amount',
                type: 'integer',
                isNullable: true,
            }),
        );
        await queryRunner.changeColumn(
            'batches',
            'price',
            new TableColumn({
                name: 'price',
                type: 'money',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'batches',
            'amount',
            new TableColumn({
                name: 'amount',
                type: 'integer',
            }),
        );
        await queryRunner.changeColumn(
            'batches',
            'price',
            new TableColumn({
                name: 'price',
                type: 'money',
            }),
        );
    }
}
