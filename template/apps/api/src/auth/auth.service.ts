import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { AuthInput, AuthResult } from 'lib/types';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/users.repository';

export type JwtPayload = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (!input.email || !input.password || input.password.trim() === '') {
      console.error('Invalid credentials provided');
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.validateUser(input);
    if (!user) {
      console.error('User not found or invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(new UserEntity(user));
  }

  async validateUser(authInput: AuthInput): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(authInput.email);

    if (user && (await compare(authInput.password, user.password))) {
      return user;
    }
    return null;
  }

  private buildJwtPayload(user: UserEntity): JwtPayload {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
    };
  }

  async signIn(user: UserEntity): Promise<AuthResult> {
    const accessToken = this.jwtService.sign(this.buildJwtPayload(user));
    return {
      token: {
        accessToken,
        issuedAt: Math.floor(Date.now()), // Current time in milliseconds
        expiresAt: Math.floor(Date.now()) + 30 * 60 * 1000, // 30 minutes later
      },
      user: user,
    };
  }

  async renewSession(user: UserEntity): Promise<AuthResult> {
    return this.signIn(user);
  }

  async signUp(data: CreateUserDto): Promise<AuthResult> {
    const user = new UserEntity(
      await this.userRepository.create({
        ...data,
        password: await hash(data.password, 10),
      }),
    );
    return this.signIn(user);
  }
}
