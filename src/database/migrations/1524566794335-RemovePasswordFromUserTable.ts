import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemovePasswordFromUserTable1524566794335 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        await queryRunner.dropColumn(table, { name: 'password' } as TableColumn);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        const column = new TableColumn({
            name: 'password',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: false,
        });
        await queryRunner.addColumn(table, column);
    }

}
