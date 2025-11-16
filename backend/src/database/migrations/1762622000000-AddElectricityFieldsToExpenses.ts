import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddElectricityFieldsToExpenses1762622000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar período de electricidad
    await queryRunner.addColumn(
      'expenses',
      new TableColumn({
        name: 'electricityPeriod',
        type: 'varchar',
        length: '7',
        isNullable: true,
        comment: 'Período de electricidad en formato YYYY-MM',
      }),
    );

    // Agregar total cobrado a huéspedes
    await queryRunner.addColumn(
      'expenses',
      new TableColumn({
        name: 'electricityTotalCharged',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Total cobrado a huéspedes por electricidad ese mes',
      }),
    );

    // Agregar diferencia (cobrado - pagado)
    await queryRunner.addColumn(
      'expenses',
      new TableColumn({
        name: 'electricityDifference',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Diferencia entre cobrado y pagado',
      }),
    );

    // Agregar contador de reservas
    await queryRunner.addColumn(
      'expenses',
      new TableColumn({
        name: 'electricityReservationsCount',
        type: 'integer',
        isNullable: true,
        comment: 'Cantidad de reservas con electricidad ese mes',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('expenses', 'electricityReservationsCount');
    await queryRunner.dropColumn('expenses', 'electricityDifference');
    await queryRunner.dropColumn('expenses', 'electricityTotalCharged');
    await queryRunner.dropColumn('expenses', 'electricityPeriod');
  }
}
