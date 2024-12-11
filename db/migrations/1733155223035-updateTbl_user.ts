import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTblUser1733155223035 implements MigrationInterface {
    name = 'UpdateTblUser1733155223035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "otp" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otpExpiry" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otpExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp"`);
    }

}
