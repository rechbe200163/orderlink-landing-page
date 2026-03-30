import { User } from '@workspace/database';
import { UserEntity } from 'src/users/entities/user.entity';
import { Request as ExpressRequest } from 'express';
export type AuthInput = {
  email: string;
  password: string;
};

export type Token = {
  accessToken: string;
  issuedAt: number;
  expiresAt: number;
};

export type AuthResult = {
  token: Token;
  user: UserEntity;
};
export type RequestWithUser = ExpressRequest & { user: UserEntity };
