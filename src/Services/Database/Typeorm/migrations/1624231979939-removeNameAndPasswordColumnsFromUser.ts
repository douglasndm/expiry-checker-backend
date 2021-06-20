import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class removeNameAndPasswordColumnsFromUser1624231979939
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'name');
        await queryRunner.dropColumn('users', 'last_name');
        await queryRunner.dropColumn('users', 'password');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'name',
                type: 'varchar',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'last_name',
                type: 'varchar',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }
}
