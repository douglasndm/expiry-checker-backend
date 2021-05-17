import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addFirebaseUIDToUsers1621214771228 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'firebase_uid',
                type: 'varchar',
                isNullable: false,
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'firebase_uid');
    }
}
