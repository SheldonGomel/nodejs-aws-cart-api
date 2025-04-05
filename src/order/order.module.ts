import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { DatabaseModule } from 'src/database/database.module';
import { OrderController } from './order.controller';
import { CartService } from 'src/cart';

@Module({
  imports: [DatabaseModule],
  providers: [OrderService, CartService],
  exports: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
