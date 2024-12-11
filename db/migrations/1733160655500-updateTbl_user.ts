import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTblUser1733160655500 implements MigrationInterface {
    name = 'UpdateTblUser1733160655500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isFirstLogin" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isFirstLogin"`);
    }

}
