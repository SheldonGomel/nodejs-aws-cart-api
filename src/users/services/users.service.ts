import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(name: string): Promise<User> {
    return this.userRepository.findOneBy({ name });
  }

  async createOne({
    name,
    password,
    email = undefined,
  }: DeepPartial<User>): Promise<User> {
    const id = randomUUID();
    const user = this.userRepository.create({ id, name, password, email });
    return this.userRepository.save(user);
  }
}
