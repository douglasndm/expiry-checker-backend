import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class addingMoreDetailsOnLogsTable1655758942679
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users_logs', 'target');
        await queryRunner.dropColumn('users_logs', 'target_id');

        await queryRunner.addColumns('users_logs', [
            new TableColumn({
                name: 'product_id',
                type: 'uuid',
                isNullable: true,
            }),
            new TableColumn({
                name: 'batch_id',
                type: 'uuid',
                isNullable: true,
            }),
            new TableColumn({
                name: 'category_id',
                type: 'uuid',
                isNullable: true,
            }),
        ]);

        await queryRunner.createForeignKey(
            'users_logs',
            new TableForeignKey({
                name: 'product_id',
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users_products',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'users_logs',
            new TableForeignKey({
                name: 'batch_id',
                columnNames: ['batch_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'batches',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'users_logs',
            new TableForeignKey({
                name: 'category_id',
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_logs', 'product_id');
        await queryRunner.dropForeignKey('users_logs', 'batch_id');
        await queryRunner.dropForeignKey('users_logs', 'category_id');

        await queryRunner.dropColumn('users_logs', 'product_id');
        await queryRunner.dropColumn('users_logs', 'batch_id');
        await queryRunner.dropColumn('users_logs', 'category_id');

        await queryRunner.addColumns('users_logs', [
            new TableColumn({
                name: 'target',
                type: 'varchar',
                isNullable: false,
            }),
            new TableColumn({
                name: 'target_id',
                type: 'uuid',
                isNullable: true, // If it a delete of a product for example
            }),
        ]);
    }
}
