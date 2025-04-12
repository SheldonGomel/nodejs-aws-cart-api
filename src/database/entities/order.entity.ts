import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Cart } from './cart.entity';
import { Address, OrderStatus } from 'src/order/type';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  user: User;

  @ManyToOne(() => Cart, (cart) => cart.id, { nullable: false })
  cart: Cart;

  @Column({ type: 'json', nullable: false })
  address: Address;

  @Column({ type: 'json', nullable: false })
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: number;
    comment: string;
  }>;

  @Column({ type: 'decimal', nullable: false })
  total: number;
}
