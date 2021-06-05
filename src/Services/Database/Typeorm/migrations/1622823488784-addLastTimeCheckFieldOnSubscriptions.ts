import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addLastTimeCheckFieldOnSubscriptions1622823488784
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'teams',
            new TableColumn({
                name: 'subs_last_time_checked',
                type: 'date',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('teams', 'subs_last_time_checked');
    }
}
