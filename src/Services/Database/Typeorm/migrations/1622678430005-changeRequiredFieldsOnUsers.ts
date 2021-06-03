import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class changeRequiredFieldsOnUsers1622678430005
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users',
            'name',
            new TableColumn({
                name: 'name',
                type: 'varchar',
                isNullable: true,
            }),
        );

        await queryRunner.changeColumn(
            'users',
            'last_name',
            new TableColumn({
                name: 'last_name',
                type: 'varchar',
                isNullable: true,
            }),
        );

        await queryRunner.changeColumn(
            'users',
            'password',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users',
            'name',
            new TableColumn({
                name: 'name',
                type: 'varchar',
                isNullable: false,
            }),
        );

        await queryRunner.changeColumn(
            'users',
            'last_name',
            new TableColumn({
                name: 'last_name',
                type: 'varchar',
                isNullable: false,
            }),
        );

        await queryRunner.changeColumn(
            'users',
            'password',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: false,
            }),
        );
    }
}
