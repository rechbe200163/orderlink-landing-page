import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { ConfigService } from '@nestjs/config';
// import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    UsersModule,
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
