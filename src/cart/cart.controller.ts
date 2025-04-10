import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CartItem } from './models/cartItem';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import { Order } from '../order/models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );
    return cart.items;
  }

  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );
    return cart.items;
  }

  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearUserCart(@Req() req: AppRequest): Promise<void> {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(
    @Req() req: AppRequest,
    @Body() body: CreateOrderDto,
  ): Promise<{ order: Order }> {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const total = calculateCartTotal(cart.items);
    const order = await this.orderService.create({
      userId,
      cartId: cart.id,
      items: cart.items.map(({ product, count }) => ({
        productId: product.id,
        count,
      })),
      address: body.address,
      total,
      status: 'CREATED',
    });

    await this.cartService.removeByUserId(userId);

    return { order };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrders(): Promise<Order[]> {
    return this.orderService.getAll();
  }
}
