import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addColumsForBatchDiscount1628296356038
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('batches', [
            new TableColumn({
                name: 'tmp_price',
                type: 'money',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('batches', 'tmp_price');
    }
}
