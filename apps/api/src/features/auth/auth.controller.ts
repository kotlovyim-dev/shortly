import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Response } from 'express';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import type { CurrentUserPayload } from './auth-user.type';
import {
  AUTH_ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_ACCESS_TOKEN_COOKIE_PATH,
  AUTH_REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  AUTH_REFRESH_TOKEN_COOKIE_NAME,
  AUTH_REFRESH_TOKEN_COOKIE_PATH,
} from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const tokens = await this.authService.register(registerDto);

    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const tokens = await this.authService.login(loginDto);

    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: CurrentUserPayload): CurrentUserPayload {
    return currentUser;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = this.getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refresh(refreshToken);

    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = this.getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    await this.authService.logout(refreshToken, currentUser);
    response.clearCookie(AUTH_ACCESS_TOKEN_COOKIE_NAME, {
      path: AUTH_ACCESS_TOKEN_COOKIE_PATH,
    });
    response.clearCookie(AUTH_REFRESH_TOKEN_COOKIE_NAME, {
      path: AUTH_REFRESH_TOKEN_COOKIE_PATH,
    });
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    response.cookie(AUTH_ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: AUTH_ACCESS_TOKEN_COOKIE_PATH,
      maxAge: AUTH_ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
    });

    response.cookie(AUTH_REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: AUTH_REFRESH_TOKEN_COOKIE_PATH,
      maxAge: AUTH_REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
    });
  }

  private getRefreshTokenFromCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    const refreshCookie = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_REFRESH_TOKEN_COOKIE_NAME}=`));

    if (!refreshCookie) {
      return undefined;
    }

    return decodeURIComponent(
      refreshCookie.slice(`${AUTH_REFRESH_TOKEN_COOKIE_NAME}=`.length),
    );
  }
}
