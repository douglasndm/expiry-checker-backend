import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveIsActiveFromTeamSubscription1735936951482
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('team_subscriptions', 'is_active');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'team_subscriptions',
            new TableColumn({
                name: 'is_active',
                type: 'boolean',
                isNullable: false,
                default: true,
            }),
        );
    }
}
