import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addMoreFieldsOnUser1635717896478 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('users', [
            new TableColumn({
                name: 'name',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'last_name',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'name');
        await queryRunner.dropColumn('users', 'last_name');
        await queryRunner.dropColumn('users', 'password');
    }
}
