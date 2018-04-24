import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAuth0ToTheUserTable1524563732519 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        const column = new TableColumn({
            name: 'auth0',
            type: 'varchar',
            length: '255',
        });
        await queryRunner.addColumn(table, column);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('user');
        await queryRunner.dropColumn(table, { name: 'auth0' } as TableColumn);
    }

}
