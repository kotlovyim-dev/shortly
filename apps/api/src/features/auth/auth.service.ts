import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../config/db/prisma.service';
import type { CurrentUserPayload } from './auth-user.type';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type AuthPayload = {
  sub: string;
  email: string;
  name: string | null;
};

const PASSWORD_SALT_ROUNDS = 10;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenPair> {
    const passwordHash = await bcrypt.hash(
      registerDto.password,
      PASSWORD_SALT_ROUNDS,
    );

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: registerDto.email,
            passwordHash,
            name: registerDto.name,
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        const tokens = await this.issueTokens({
          sub: user.id,
          email: user.email,
          name: user.name,
        });

        await tx.refreshToken.create({
          data: {
            ...this.buildRefreshTokenRecord(user.id, tokens.refreshToken),
          },
        });

        return tokens;
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Email is already in use');
      }

      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<TokenPair> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    await this.prismaService.refreshToken.create({
      data: this.buildRefreshTokenRecord(user.id, tokens.refreshToken),
    });

    return tokens;
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);
    const now = new Date();

    return this.prismaService.$transaction(async (tx) => {
      const storedRefreshToken = await tx.refreshToken.findUnique({
        where: {
          tokenHash,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!storedRefreshToken || storedRefreshToken.expiresAt <= now) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.issueTokens({
        sub: storedRefreshToken.user.id,
        email: storedRefreshToken.user.email,
        name: storedRefreshToken.user.name,
      });

      await tx.refreshToken.delete({
        where: {
          tokenHash,
        },
      });

      await tx.refreshToken.create({
        data: this.buildRefreshTokenRecord(
          storedRefreshToken.user.id,
          tokens.refreshToken,
        ),
      });

      return tokens;
    });
  }

  async logout(
    refreshToken: string,
    currentUser: CurrentUserPayload,
  ): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const storedRefreshToken = await this.prismaService.refreshToken.findUnique(
      {
        where: {
          tokenHash,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    );

    if (!storedRefreshToken) {
      return;
    }

    if (storedRefreshToken.user.id !== currentUser.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      await this.prismaService.refreshToken.delete({
        where: {
          tokenHash,
        },
      });
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        return;
      }

      throw new InternalServerErrorException('Failed to logout user');
    }
  }

  private async issueTokens(payload: AuthPayload): Promise<TokenPair> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const uniquePayload = {
      ...payload,
      jti: randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(uniquePayload, {
      secret,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    const refreshToken = await this.jwtService.signAsync(uniquePayload, {
      secret,
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildRefreshTokenRecord(userId: string, refreshToken: string) {
    return {
      id: randomUUID(),
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      userId,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }

  private isRecordNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    );
  }
}
