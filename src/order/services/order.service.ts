import { Injectable } from '@nestjs/common';
import { Order } from 'src/database/entities/order.entity';
import { Cart } from 'src/database/entities/cart.entity';
import { User } from 'src/database/entities/user.entity';
import {
  Order as OrderType,
  StatusHistory,
  StatusHistoryItem,
} from '../models';
import { CreateOrderPayload, OrderStatus } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<OrderType[]> {
    const orders = await this.orderRepository.find({
      relations: {
        user: true,
        cart: {
          items: {
            product: true,
          },
        },
      },
    });
    return orders.map((order) => ({
      id: order.id,
      userId: order.user.id,
      cartId: order.cart.id,
      items: order.cart.items.map((item) => ({
        productId: item.product.id,
        count: item.count,
      })),
      address: order.address,
      statusHistory: order.statusHistory,
    }));
  }

  async findById(orderId: string): Promise<OrderType> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        user: true,
        cart: {
          items: {
            product: true,
          },
        },
      },
    });
    return {
      id: order.id,
      userId: order.user.id,
      cartId: order.cart.id,
      items: order.cart.items.map((item) => ({
        productId: item.product.id,
        count: item.count,
      })),
      address: order.address,
      statusHistory: order.statusHistory as StatusHistory,
    };
  }

  async create(
    data: CreateOrderPayload,
    queryRunner?: QueryRunner,
  ): Promise<OrderType> {
    const order = this.orderRepository.create({
      ...data,
      user: await this.userRepository.findOneBy({ id: data.userId }),
      cart: await this.cartRepository.findOneBy({ id: data.cartId }),
      statusHistory: [
        {
          status: OrderStatus.Open,
          timestamp: Date.now(),
          comment: data.address.comment,
        },
      ],
    });
    if (queryRunner) {
      // Use the transaction manager if a QueryRunner is provided
      await queryRunner.manager.save(order);
    } else {
      await this.orderRepository.save(order);
    }

    return {
      id: order.id,
      userId: order.user.id,
      cartId: order.cart.id,
      items: data.items,
      address: order.address,
      statusHistory: order.statusHistory as StatusHistory,
    };
  }

  // TODO add  type
  async update(orderId: string, data: StatusHistoryItem): Promise<OrderType> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        user: true,
        cart: {
          items: {
            product: true,
          },
        },
      },
    });
    if (!order) {
      throw new Error('Order not found');
    }
    order.statusHistory = [
      ...order.statusHistory,
      {
        status: data.status,
        timestamp: Date.now(),
        comment: data.comment,
      },
    ];
    const updatedOrder = await this.orderRepository.save(order);
    return {
      id: updatedOrder.id,
      userId: updatedOrder.user.id,
      cartId: updatedOrder.cart.id,
      items: updatedOrder.cart.items.map((item) => ({
        productId: item.product.id,
        count: item.count,
      })),
      address: updatedOrder.address,
      statusHistory: updatedOrder.statusHistory,
    };
  }

  async delete(orderId: string): Promise<void> {
    await this.orderRepository.delete(orderId);
  }
}
