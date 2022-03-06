import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeProductsTableName1646529973364
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('products', 'users_products');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('user_products', 'products');
    }
}
