import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class changingOnDeleteOfATeamInBrand1695078283910
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('brands', 'team_id');

        await queryRunner.createForeignKey(
            'brands',
            new TableForeignKey({
                name: 'team_id',
                columnNames: ['team_id'],
                referencedTableName: 'teams',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('brands', 'team_id');

        await queryRunner.createForeignKey(
            'brands',
            new TableForeignKey({
                columnNames: ['team_id'],
                referencedTableName: 'teams',
                referencedColumnNames: ['id'],
            }),
        );
    }
}
