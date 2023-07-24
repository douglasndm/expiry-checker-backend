import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class removeAllowCollectProductSetting1690164465669
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'teams_preferences',
            'allow_collect_product',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'teams_preferences',
            new TableColumn({
                name: 'allow_collect_product',
                type: 'boolean',
                default: false,
            }),
        );
    }
}
