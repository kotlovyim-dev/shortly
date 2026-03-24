import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/features/auth/auth.module';
import { PrismaService } from '../src/config/db/prisma.service';

jest.mock('../src/config/db/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
};

type StoredRefreshToken = {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  userId: string;
};

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

function createPrismaMock() {
  const usersByEmail = new Map<string, StoredUser>();
  const usersById = new Map<string, StoredUser>();
  const refreshTokens = new Map<string, StoredRefreshToken>();

  const prismaService = {
    user: {
      findUnique: jest.fn(
        async ({ where }: { where: { email: string } }) =>
          usersByEmail.get(where.email) ?? null,
      ),
      create: jest.fn(
        async ({
          data,
        }: {
          data: { email: string; passwordHash: string; name: string };
        }) => {
          const user: StoredUser = {
            id: `user-${usersByEmail.size + 1}`,
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
          };

          usersByEmail.set(user.email, user);
          usersById.set(user.id, user);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        },
      ),
    },
    refreshToken: {
      findUnique: jest.fn(
        async ({ where }: { where: { tokenHash: string } }) => {
          const refreshToken = refreshTokens.get(where.tokenHash);

          if (!refreshToken) {
            return null;
          }

          const user = usersById.get(refreshToken.userId);

          if (!user) {
            return null;
          }

          return {
            ...refreshToken,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          };
        },
      ),
      create: jest.fn(async ({ data }: { data: StoredRefreshToken }) => {
        refreshTokens.set(data.tokenHash, data);
        return data;
      }),
      delete: jest.fn(async ({ where }: { where: { tokenHash: string } }) => {
        const refreshToken = refreshTokens.get(where.tokenHash);

        if (!refreshToken) {
          const error = new Error('Record not found');

          (error as Error & { code?: string }).code = 'P2025';
          throw error;
        }

        refreshTokens.delete(where.tokenHash);
        return refreshToken;
      }),
    },
    $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) =>
      callback(prismaService),
    ),
  };

  return {
    prismaService,
    reset: () => {
      usersByEmail.clear();
      usersById.clear();
      refreshTokens.clear();
      jest.clearAllMocks();
    },
  };
}

function createPrismaMockModule(prismaService: unknown) {
  return {
    global: true,
    module: class PrismaMockModule {},
    providers: [
      {
        provide: PrismaService,
        useValue: prismaService,
      },
    ],
    exports: [PrismaService],
  };
}

function extractRefreshToken(
  setCookieHeader: string | string[] | undefined,
): string {
  const cookie = Array.isArray(setCookieHeader)
    ? setCookieHeader.find((value) => value.startsWith('refreshToken='))
    : setCookieHeader?.startsWith('refreshToken=')
      ? setCookieHeader
      : undefined;

  if (!cookie) {
    throw new Error('Refresh token cookie not found');
  }

  return decodeURIComponent(cookie.split(';')[0].slice('refreshToken='.length));
}

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let resetStore: () => void;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-for-e2e';

    const { prismaService, reset } = createPrismaMock();
    resetStore = reset;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        createPrismaMockModule(prismaService),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    resetStore();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('registers a user and sets the refresh cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'password123',
        name: 'Alice',
      })
      .expect(201);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );
  });

  it('logs in an existing user and returns only an access token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'password123',
        name: 'Alice',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );
  });

  it('refreshes access tokens using the refresh cookie and rotates the refresh token', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'password123',
        name: 'Alice',
      })
      .expect(201);

    const refreshCookie = extractRefreshToken(
      registerResponse.headers['set-cookie'],
    );

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${encodeURIComponent(refreshCookie)}`)
      .send({})
      .expect(200);

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    expect(refreshResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${encodeURIComponent(refreshCookie)}`)
      .send({})
      .expect(401);
  });

  it('logs out the current user and revokes the refresh token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'password123',
        name: 'Alice',
      })
      .expect(201);

    const accessToken = loginResponse.body.accessToken;
    const refreshToken = extractRefreshToken(
      loginResponse.headers['set-cookie'],
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${encodeURIComponent(refreshToken)}`)
      .send({})
      .expect(401);
  });

  it('rejects logout when the access token is missing', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'password123',
        name: 'Alice',
      })
      .expect(201);

    const refreshToken = extractRefreshToken(
      registerResponse.headers['set-cookie'],
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(401);
  });
});
