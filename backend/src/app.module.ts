import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { PropertiesModule } from '@/modules/properties/properties.module';
import { ReservationsModule } from '@/modules/reservations/reservations.module';
import { ExpensesModule } from '@/modules/expenses/expenses.module';
import { FinancialsModule } from '@/modules/financials/financials.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'apartamento_airbnb',
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    PropertiesModule,
    ReservationsModule,
    ExpensesModule,
    FinancialsModule,
    UsersModule,
  ],
})
export class AppModule {}
