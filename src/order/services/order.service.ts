import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../models';
import { CreateOrderPayload, OrderStatus } from '../type';
import { User } from '../../users/models';
import { Cart } from '../../cart/models/index';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async getAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'cart', 'cart.items'],
    });
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'cart', 'cart.items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });
    const cart = await this.cartRepository.findOne({
      where: { id: data.cartId },
      relations: ['items'],
    });

    if (!user || !cart) {
      throw new NotFoundException('User or Cart not found');
    }

    const order = this.orderRepository.create({
      ...data,
      user,
      cart,
      statusHistory: [
        {
          comment: '',
          status: OrderStatus.Open,
          timestamp: Date.now(),
        },
      ],
    });

    return this.orderRepository.save(order);
  }

  async update(orderId: string, data: Partial<Order>): Promise<Order> {
    const order = await this.findById(orderId);

    const updatedOrder = this.orderRepository.merge(order, data);

    if (data.status && data.status !== order.status) {
      updatedOrder.statusHistory = [
        ...order.statusHistory,
        {
          status: data.status as OrderStatus,
          timestamp: Date.now(),
          comment: data.statusHistory?.[0]?.comment || '',
        },
      ];
    }

    return this.orderRepository.save(updatedOrder);
  }
}
