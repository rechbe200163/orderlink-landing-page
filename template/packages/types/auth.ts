import { User } from '../database/src';

export interface Token {
  accessToken: string;
  issuedAt: number;
  expiresAt: number;
}

export interface Session {
  token: Token;
  user: Omit<User, 'password'>;
}

export type SanitizedUser = Omit<User, 'password'>;
