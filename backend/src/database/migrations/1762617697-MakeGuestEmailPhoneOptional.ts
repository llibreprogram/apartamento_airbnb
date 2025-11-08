import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeGuestEmailPhoneOptional1762617697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hacer nullable las columnas guestEmail y guestPhone
    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ALTER COLUMN "guestEmail" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ALTER COLUMN "guestPhone" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios (hacer NOT NULL nuevamente)
    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ALTER COLUMN "guestEmail" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ALTER COLUMN "guestPhone" SET NOT NULL
    `);
  }
}
