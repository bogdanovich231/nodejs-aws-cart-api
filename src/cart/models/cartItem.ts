import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './index';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  product: Product;

  @Column()
  count: number;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart?: Cart;
}
