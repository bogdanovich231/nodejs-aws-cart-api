import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/models';
import * as bcrypt from 'bcryptjs';

type TokenResponse = {
  token_type: string;
  access_token: string;
  expires_in?: number;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: Omit<User, 'id'>): Promise<{ userId: string }> {
    const existingUser = await this.usersService.findOne(payload.name);

    if (existingUser) {
      throw new BadRequestException('User with such name already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.usersService.createOne({
      ...payload,
      password: hashedPassword,
    });

    return { userId: user.id };
  }

  async validateUser(name: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(name);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(
    user: User,
    type: 'jwt' | 'basic' = 'jwt',
  ): Promise<TokenResponse> {
    const loginStrategies = {
      jwt: this.loginJWT.bind(this),
      basic: this.loginBasic.bind(this),
    };

    return loginStrategies[type](user);
  }

  private loginJWT(user: User): TokenResponse {
    const payload = {
      username: user.name,
      sub: user.id,
    };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  private loginBasic(user: User): TokenResponse {
    const encodeUserToken = (user: User) => {
      const { name, password } = user;
      const buf = Buffer.from([name, password].join(':'), 'utf8');
      return buf.toString('base64');
    };

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
