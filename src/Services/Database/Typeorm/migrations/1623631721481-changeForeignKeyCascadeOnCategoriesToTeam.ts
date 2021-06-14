import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class changeForeignKeyCascadeOnCategoriesToTeam1623631721481
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'categories',
            'FK_6248eea7ccc44c42637e6c55b9c',
        );

        await queryRunner.createForeignKey(
            'categories',
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
        await queryRunner.dropForeignKey('categories', 'team_id');

        await queryRunner.createForeignKey(
            'categories',
            new TableForeignKey({
                columnNames: ['team_id'],
                referencedTableName: 'teams',
                referencedColumnNames: ['id'],
            }),
        );
    }
}
