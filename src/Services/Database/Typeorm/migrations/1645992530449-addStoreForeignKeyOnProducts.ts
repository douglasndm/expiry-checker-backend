import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class addStoreForeignKeyOnProducts1645992530449
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'store_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                name: 'store_id',
                columnNames: ['store_id'],
                referencedTableName: 'stores',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('products', 'store_id');
        await queryRunner.dropColumn('products', 'store_id');
    }
}
