import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddElectricityFieldsToReservations1762620000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityConsumed',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityCharge',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityRate',
        type: 'decimal',
        precision: 6,
        scale: 4,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'meterReadingStart',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'meterReadingEnd',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityPaymentMethod',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityNotes',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('reservations', 'electricityNotes');
    await queryRunner.dropColumn('reservations', 'electricityPaymentMethod');
    await queryRunner.dropColumn('reservations', 'meterReadingEnd');
    await queryRunner.dropColumn('reservations', 'meterReadingStart');
    await queryRunner.dropColumn('reservations', 'electricityRate');
    await queryRunner.dropColumn('reservations', 'electricityCharge');
    await queryRunner.dropColumn('reservations', 'electricityConsumed');
  }
}
