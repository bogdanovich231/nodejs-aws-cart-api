import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../order/models/index';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  name: string;

  @Column()
  email?: string;

  @Column()
  password: string;

  @OneToMany(() => Order, (order) => order.user)
  carts?: Order[];
}
