import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MqttModule } from './mqtt/mqtt.module';
import { DevicesModule } from './devices/devices.module';
import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MQTT_BROKER_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
});

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../packages/database/.env'],
      validate: (env) => envSchema.parse(env),
    }),
    MqttModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
