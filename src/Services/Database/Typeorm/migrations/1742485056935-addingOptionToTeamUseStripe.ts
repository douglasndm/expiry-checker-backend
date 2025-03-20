import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddingOptionToTeamUseStripe1742485056935
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'teams',
			new TableColumn({
				name: 'use_stripe',
				type: 'boolean',
				default: false,
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('teams', 'use_stripe');
	}
}
