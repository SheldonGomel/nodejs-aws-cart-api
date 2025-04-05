import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cart } from './cart.entity';
import { Order } from './order.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @OneToMany(() => Cart, (cart) => cart.user_id, { cascade: true })
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user, { cascade: true })
  orders: Order[];
}
