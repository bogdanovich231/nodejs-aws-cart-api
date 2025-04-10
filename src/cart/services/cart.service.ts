import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatus } from '../models/index';
import { CartItem } from '../models/cartItem';
import { PutCartPayload } from 'src/order/type';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items'],
    });
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const cart = this.cartRepository.create({
      user_id,
      status: CartStatus.OPEN,
      items: [],
    });

    return this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await this.createByUserId(userId);
    }

    return cart;
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.id === payload.product.id,
    );

    if (existingItemIndex === -1) {
      if (payload.count > 0) {
        const newItem = this.cartItemRepository.create({
          ...payload,
          cart,
        });
        cart.items.push(newItem);
      }
    } else {
      if (payload.count === 0) {
        await this.cartItemRepository.remove(cart.items[existingItemIndex]);
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].count = payload.count;
        await this.cartItemRepository.save(cart.items[existingItemIndex]);
      }
    }

    return this.cartRepository.save(cart);
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      await this.cartRepository.remove(cart);
    }
  }
}
