import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
// import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
@Module({
  controllers: [AuthController],
  imports: [
    // TypedEventEmitterModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', ''),
        signOptions: { expiresIn: '30m' },
      }),
    }),
    PassportModule,
  ],
})
export class AuthModule {}
