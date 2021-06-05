import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class addCascadeOnDeleteOfProductsInBatches1622850147709
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'batches',
            'FK_07ad38527d0d87601f3b05a6a22',
        );

        await queryRunner.createForeignKey(
            'batches',
            new TableForeignKey({
                name: 'product_id',
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('batches', 'product_id');

        await queryRunner.createForeignKey(
            'batches',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
            }),
        );
    }
}
