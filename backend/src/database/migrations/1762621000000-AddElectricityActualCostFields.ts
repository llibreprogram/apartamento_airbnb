import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddElectricityActualCostFields1762621000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar campo para el costo real pagado por el propietario
    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityActualCost',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Costo real de electricidad pagado por el propietario',
      }),
    );

    // Agregar fecha de la factura eléctrica
    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityBillDate',
        type: 'date',
        isNullable: true,
        comment: 'Fecha de la factura de electricidad',
      }),
    );

    // Agregar notas sobre la factura
    await queryRunner.addColumn(
      'reservations',
      new TableColumn({
        name: 'electricityBillNotes',
        type: 'text',
        isNullable: true,
        comment: 'Notas sobre la factura de electricidad',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('reservations', 'electricityBillNotes');
    await queryRunner.dropColumn('reservations', 'electricityBillDate');
    await queryRunner.dropColumn('reservations', 'electricityActualCost');
  }
}
