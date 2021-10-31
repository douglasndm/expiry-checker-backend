import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class addOnDeleteCascadeForTeamBrands1635717448748
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'brands',
            'FK_4f3c96ba594262eeba6da02057a',
        );

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
