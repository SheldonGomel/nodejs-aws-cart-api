import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Param,
  Delete,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { CartService, CartStatuses } from '../cart';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { StatusHistoryItem } from './models';
import { CreateOrderDto } from './type';
import { calculateCartTotal } from 'src/cart/models-rules';
import { DataSource } from 'typeorm';

@Controller('api/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Put()
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(items);

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.orderService.create(
        {
          userId,
          cartId,
          items: items.map(({ product, count }) => ({
            productId: product.id,
            count,
          })),
          address: body.address,
          total,
        },
        queryRunner,
      );
      await this.cartService.updateStatus(
        cartId,
        CartStatuses.ORDERED,
        queryRunner,
      );
      // Commit the transaction
      await queryRunner.commitTransaction();
      return { order };
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id/status')
  async updateOrder(@Param('id') id: string, @Body() body: StatusHistoryItem) {
    const order = await this.orderService.update(id, body);
    return order;
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getOrder() {
    console.log('get order');
    return await this.orderService.getAll();
  }

  @UseGuards(BasicAuthGuard)
  @Get('/:id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.findById(id);
    return order;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteOrder(@Param('id') id: string) {
    const order = await this.orderService.delete(id);
    return order;
  }
}
