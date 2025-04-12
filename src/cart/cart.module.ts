import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './services';
import { DatabaseModule } from 'src/database/database.module';
import { OrderService } from 'src/order';

@Module({
  imports: [DatabaseModule],
  providers: [CartService, OrderService],
  controllers: [CartController],
})
export class CartModule {}
