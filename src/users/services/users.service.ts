import { Injectable } from '@nestjs/common';
import { User } from '../models';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(name: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { name } });
  }

  async createOne(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
