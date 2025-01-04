import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class AddCategoryIdToTeamsProducts1736020657810
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'team_products',
            new TableColumn({
                name: 'category_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        // Adicionar a foreign key para a tabela de categorias
        await queryRunner.createForeignKey(
            'team_products',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
            }),
        );

        // Copiar os dados da tabela ProductCategory para a tabela de produtos
        const productCategories = await queryRunner.query(
            'SELECT * FROM product_category',
        );

        for await (const productCategory of productCategories) {
            await queryRunner.query(
                `UPDATE team_products SET category_id = '${productCategory.category_id}' WHERE id = '${productCategory.product_id}'`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('product', 'category_id');
        await queryRunner.dropColumn('product', 'category_id');
    }
}
