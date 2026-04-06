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
