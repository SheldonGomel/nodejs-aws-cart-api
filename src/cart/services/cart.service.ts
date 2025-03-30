import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Repository } from 'typeorm';
import { Cart } from 'src/database/entities/cart.entity';
import { CartItem } from 'src/database/entities/cartitem.entity';
import { Product } from 'src/database/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findByUserId(userId: string) {
    return await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  async createByUserId(user_id: string) {
    const userCart = {
      id: randomUUID(),
      user_id,
      created_at: new Date(),
      updated_at: new Date(),
      status: CartStatuses.OPEN,
      items: [],
    };

    const cart = this.cartRepository.create(userCart);
    console.log('cart = ', cart);
    return await this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string) {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload) {
    const userCart = await this.findOrCreateByUserId(userId);
    console.log('userCart = ', userCart);

    const index = userCart.items.findIndex(
      ({ product }) => product.id === payload.product.id,
    );

    if (index === -1) {
      const product = this.productRepository.create(payload.product);
      await this.productRepository.save(product);
      const cartItem = this.cartItemRepository.create({
        product,
        count: payload.count,
      });
      await this.cartItemRepository.save(cartItem);
      userCart.items.push(cartItem);
    } else if (payload.count === 0) {
      userCart.items.splice(index, 1);
    } else {
      userCart.items[index].count = payload.count;
    }

    return await this.cartRepository.save(userCart);
  }

  async removeByUserId(userId: string) {
    return await this.cartRepository.delete({ user_id: userId });
  }
}
