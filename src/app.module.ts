import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/models';
import { Cart } from './cart/models/index';
import { Order } from './order/models';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        host: 'rsdatabase.cfmkgeaa86l4.eu-west-1.rds.amazonaws.com',
        port: 5432,
        username: 'postgres',
        password: '0hlpMp0kalQmlFHIqBIZ',
        database: 'rsdatabase',
        entities: [User, Cart, Order],
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CartModule,
    OrderModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
