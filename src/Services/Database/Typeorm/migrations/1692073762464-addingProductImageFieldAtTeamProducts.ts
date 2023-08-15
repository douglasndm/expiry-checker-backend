import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddingProductImageFieldAtTeamProducts1692073762464
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('users_products', 'team_products');

        await queryRunner.addColumn(
            'team_products',
            new TableColumn({
                name: 'image',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('team_products', 'image');

        await queryRunner.renameTable('team_products', 'users_products');
    }
}
