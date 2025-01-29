import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from 'typeorm';

export class AddTeamIdToTeamsProduct1736031185164
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'team_products',
            new TableColumn({
                name: 'team_id',
                type: 'uuid',
                isNullable: true,
            }),
        );

        // Adicionar a foreign key para a tabela de teams
        await queryRunner.createForeignKey(
            'team_products',
            new TableForeignKey({
                columnNames: ['team_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'teams',
                onDelete: 'SET NULL',
            }),
        );

        // Copiar os dados da tabela ProductCategory para a tabela de produtos
        const productsTeams = await queryRunner.query(
            'SELECT * FROM product_teams',
        );

        for await (const product of productsTeams) {
            await queryRunner.query(
                `UPDATE team_products SET team_id = '${product.team_id}' WHERE id = '${product.product_id}'`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('product', 'team_id');
        await queryRunner.dropColumn('product', 'team_id');
    }
}
