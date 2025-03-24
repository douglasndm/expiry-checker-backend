import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class RemovingProductsRequestTable1742776246250
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('products_request');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'products_request',
				columns: [
					{
						name: 'id',
						type: 'int',
						isPrimary: true,
						isGenerated: true,
						generationStrategy: 'increment',
					},
					{
						name: 'code',
						type: 'varchar',
					},
					{
						name: 'rank',
						type: 'int',
						default: 1,
					},
					{
						name: 'created_at',
						type: 'timestamp',
						default: 'now()',
					},
					{
						name: 'updated_at',
						type: 'timestamp',
						default: 'now()',
					},
				],
			})
		);
	}
}
