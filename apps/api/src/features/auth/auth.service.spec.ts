import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { PrismaService } from '../../config/db/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  __esModule: true,
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../config/db/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

describe('AuthService', () => {
  let prismaService: any;
  let jwtService: { signAsync: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let authService: AuthService;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) =>
        callback(prismaService),
      ),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    authService = new AuthService(
      prismaService as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password, creates the user, and persists a refresh token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      prismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
      });
      prismaService.refreshToken.create.mockResolvedValue({});

      await expect(
        authService.register({
          email: 'alice@example.com',
          password: 'password123',
          name: 'Alice',
        }),
      ).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            email: 'alice@example.com',
            passwordHash: 'hashed-password',
            name: 'Alice',
          },
        }),
      );
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tokenHash: hashToken('refresh-token'),
            expiresAt: expect.any(Date),
            id: expect.any(String),
          }),
        }),
      );
    });

    it('maps unique email errors to ConflictException', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaService.$transaction.mockRejectedValueOnce({ code: 'P2002' });

      await expect(
        authService.register({
          email: 'alice@example.com',
          password: 'password123',
          name: 'Alice',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('verifies credentials and persists a refresh token', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash: 'hashed-password',
        name: 'Alice',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      prismaService.refreshToken.create.mockResolvedValue({});

      await expect(
        authService.login({
          email: 'alice@example.com',
          password: 'password123',
        }),
      ).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tokenHash: hashToken('refresh-token'),
          }),
        }),
      );
    });

    it('rejects unknown users', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects invalid passwords', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash: 'hashed-password',
        name: 'Alice',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'alice@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotates the refresh token and returns a new access token', async () => {
      const expiresAt = new Date(Date.now() + 60_000);

      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'refresh-1',
        tokenHash: hashToken('refresh-token'),
        expiresAt,
        revokedAt: null,
        createdAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'alice@example.com',
          name: 'Alice',
        },
      });
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      prismaService.refreshToken.delete.mockResolvedValue({});
      prismaService.refreshToken.create.mockResolvedValue({});

      await expect(authService.refresh('refresh-token')).resolves.toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: {
          tokenHash: hashToken('refresh-token'),
        },
      });
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tokenHash: hashToken('new-refresh-token'),
          }),
        }),
      );
    });

    it('rejects expired refresh tokens', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'refresh-1',
        tokenHash: hashToken('refresh-token'),
        expiresAt: new Date(Date.now() - 60_000),
        revokedAt: null,
        createdAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'alice@example.com',
          name: 'Alice',
        },
      });

      await expect(authService.refresh('refresh-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deletes a refresh token owned by the current user', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'refresh-1',
        tokenHash: hashToken('refresh-token'),
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'alice@example.com',
        },
      });
      prismaService.refreshToken.delete.mockResolvedValue({});

      await expect(
        authService.logout('refresh-token', {
          id: 'user-1',
          email: 'alice@example.com',
        }),
      ).resolves.toBeUndefined();

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: {
          tokenHash: hashToken('refresh-token'),
        },
      });
    });

    it('rejects refresh tokens that do not belong to the current user', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'refresh-1',
        tokenHash: hashToken('refresh-token'),
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'alice@example.com',
        },
      });

      await expect(
        authService.logout('refresh-token', {
          id: 'user-2',
          email: 'mallory@example.com',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prismaService.refreshToken.delete).not.toHaveBeenCalled();
    });
  });
});
