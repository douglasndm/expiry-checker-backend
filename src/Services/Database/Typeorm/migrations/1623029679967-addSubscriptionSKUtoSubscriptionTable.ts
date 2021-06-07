import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addSubscriptionSKUtoSubscriptionTable1623029679967
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'team_subscriptions',
            new TableColumn({
                name: 'sku_bought',
                type: 'varchar',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('team_subscriptions', 'SKU_bought');
    }
}
