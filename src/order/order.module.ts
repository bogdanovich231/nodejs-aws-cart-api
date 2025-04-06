import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './models';
import { User } from '../users/models';
import { Cart } from '../cart/models/index';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Cart])],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
