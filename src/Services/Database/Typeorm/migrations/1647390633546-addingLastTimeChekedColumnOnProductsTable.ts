import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addingLastTimeChekedColumnOnProductsTable1647390633546
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('products', [
            new TableColumn({
                name: 'last_time_checked',
                type: 'timestamp',
                isNullable: true,
            }),
            new TableColumn({
                name: 'brand',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'thumbnail',
                type: 'varchar',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'last_time_checked');
        await queryRunner.dropColumn('products', 'brand');
        await queryRunner.dropColumn('products', 'thumbnail');
    }
}
