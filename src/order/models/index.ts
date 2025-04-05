import { Address, OrderStatus } from '../type';

export type StatusHistoryItem = {
  status: OrderStatus;
  timestamp: number;
  comment: string;
};

export type StatusHistory = Array<StatusHistoryItem>;

export type Order = {
  id?: string;
  userId: string;
  items: Array<{ productId: string; count: number }>;
  cartId: string;
  address: Address;
  statusHistory: StatusHistory;
};
