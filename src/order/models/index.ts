import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Cart } from '../../cart/models/index';
import { User } from '../../users/models/index';
import { OrderStatus } from '../type';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => User, (user) => user.carts)
  user?: User;

  @OneToOne(() => Cart, { cascade: true })
  cart?: Cart;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    address: string;
    firstName: string;
    lastName: string;
    comment?: string;
  };

  @Column({ type: 'varchar' })
  status?: string;

  @Column({ type: 'jsonb', default: [] })
  statusHistory: Array<{
    status: OrderStatus;
    comment?: string;
    timestamp: number;
  }>;

  @Column({ type: 'decimal' })
  total: number;

  @CreateDateColumn()
  createdAt?: Date;
}
