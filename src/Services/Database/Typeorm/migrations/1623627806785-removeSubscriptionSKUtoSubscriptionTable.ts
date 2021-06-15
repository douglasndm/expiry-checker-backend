import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class removeSubscriptionSKUtoSubscriptionTable1623627806785
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('team_subscriptions', 'sku_bought');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'team_subscriptions',
            new TableColumn({
                name: 'sku_bought',
                type: 'varchar',
            }),
        );
    }
}
