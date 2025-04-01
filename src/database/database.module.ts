import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategy';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartitem.entity';
import { Product } from './entities/product.entity';
import { config } from 'dotenv';

config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      // autoLoadEntities: true,
      // synchronize: true,
      logging: Boolean(process.env.ENABLE_LOGGING),
      namingStrategy: new SnakeNamingStrategy(),
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Cart, CartItem, Product],
    }),
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
