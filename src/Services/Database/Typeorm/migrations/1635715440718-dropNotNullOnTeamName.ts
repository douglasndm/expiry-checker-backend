import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropNotNullOnTeamName1635715440718 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE teams ALTER COLUMN name DROP NOT NULL;',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE teams ALTER COLUMN name NOT NULL;',
        );
    }
}
