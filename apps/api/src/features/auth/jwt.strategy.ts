import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from './auth.constants';
import type { CurrentUserPayload } from './auth-user.type';

function getAccessTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const accessCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_ACCESS_TOKEN_COOKIE_NAME}=`));

  if (!accessCookie) {
    return null;
  }

  return decodeURIComponent(
    accessCookie.slice(`${AUTH_ACCESS_TOKEN_COOKIE_NAME}=`.length),
  );
}

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([getAccessTokenFromCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): CurrentUserPayload {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
