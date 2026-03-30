import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { RequestWithUser } from 'lib/types';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AuthInputDto })
  @ApiOkResponse({ type: AuthResultDto })
  login(@Body() body: AuthInputDto) {
    console.log('Received login request:', body);
    return this.authService.authenticate(body);
  }

  @Post('signUp')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserDto })
  signUp(@Body() body: CreateUserDto) {
    console.log(body);
    return this.authService.signUp(body);
  }

  @Get('get-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  getProfile(@Request() request: RequestWithUser) {
    return request.user;
  }
}
