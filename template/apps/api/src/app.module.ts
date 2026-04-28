import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TenantModule } from './tenant/tenant.module';
import { AddressesModule } from './addresses/addresses.module';
import { DokployService } from './dokploy/dokploy.service';
import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1), // url() kann bei prisma strings manchmal nerven
});

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // milliseconds
          limit: 10, // requests per ttl
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService globally available
      envFilePath: '.env', // Default
      validate: (env) => envSchema.parse(env),
    }),
    TenantModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService, DokployService],
})
export class AppModule {}
