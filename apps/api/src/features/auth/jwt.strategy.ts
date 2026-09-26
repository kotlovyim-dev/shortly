import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

  try {
    return decodeURIComponent(
      accessCookie.slice(`${AUTH_ACCESS_TOKEN_COOKIE_NAME}=`.length),
    );
  } catch {
    return null;
  }
}

type JwtPayload = {
  sub: string;
  email: string;
  name?: string;
  type: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        getAccessTokenFromCookie,
      ]),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): CurrentUserPayload {
    if (payload.type !== 'access' || !payload.sub || !payload.email)
      throw new UnauthorizedException('Invalid access token');
    return {
      name: payload.name ?? null,
      id: payload.sub,
      email: payload.email,
    };
  }
}
