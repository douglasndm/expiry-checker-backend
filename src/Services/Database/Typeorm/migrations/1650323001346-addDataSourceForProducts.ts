import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addDataSourceForProducts1650323001346
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'data_from',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'data_from');
    }
}
