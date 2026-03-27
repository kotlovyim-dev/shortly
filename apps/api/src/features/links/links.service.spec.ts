import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../../config/db/prisma.service';
import type { RedisService } from '../../config/redis/redis.service';
import { LinksService } from './links.service';

jest.mock('../../config/db/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('nanoid', () => ({
  __esModule: true,
  nanoid: jest.fn(),
}));

const { nanoid } = jest.requireMock('nanoid') as {
  nanoid: jest.Mock;
};

describe('LinksService', () => {
  let prismaService: {
    $queryRaw: jest.Mock;
    $transaction: jest.Mock;
    link: {
      findMany: jest.Mock;
      count: jest.Mock;
      aggregate: jest.Mock;
    };
  };
  let redisService: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };
  let linksService: LinksService;

  beforeEach(() => {
    prismaService = {
      $queryRaw: jest.fn(),
      $transaction: jest.fn(async (operations: Array<Promise<unknown>>) =>
        Promise.all(operations),
      ),
      link: {
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    linksService = new LinksService(
      prismaService as unknown as PrismaService,
      redisService as unknown as RedisService,
    );

    jest.clearAllMocks();
  });

  it('creates a link with a generated unique short code', async () => {
    nanoid.mockReturnValue('gen12345');
    prismaService.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'link-1',
        code: 'gen12345',
        originalUrl: 'https://example.com',
        title: 'Example',
        expiresAt: null,
        clicks: 0,
        isActive: true,
        createdAt: new Date('2026-03-27T19:00:00.000Z'),
        updatedAt: new Date('2026-03-27T19:00:00.000Z'),
        userId: null,
      },
    ]);

    await expect(
      linksService.create({
        originalUrl: 'https://example.com',
        title: 'Example',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'link-1',
        shortCode: 'gen12345',
        originalUrl: 'https://example.com',
        title: 'Example',
      }),
    );

    expect(nanoid).toHaveBeenCalledWith(8);
  });

  it('rejects duplicate custom slugs', async () => {
    prismaService.$queryRaw.mockResolvedValueOnce([{ code: 'brand' }]);

    await expect(
      linksService.create({
        originalUrl: 'https://example.com',
        customSlug: 'brand',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists current user links with pagination and total clicks', async () => {
    prismaService.link.findMany.mockResolvedValue([
      {
        id: 'link-1',
        code: 'alpha123',
        originalUrl: 'https://example.com/a',
        title: 'A',
        expiresAt: null,
        clicks: 4,
        isActive: true,
        createdAt: new Date('2026-03-27T19:00:00.000Z'),
        updatedAt: new Date('2026-03-27T19:00:00.000Z'),
      },
      {
        id: 'link-2',
        code: 'beta1234',
        originalUrl: 'https://example.com/b',
        title: null,
        expiresAt: null,
        clicks: 6,
        isActive: true,
        createdAt: new Date('2026-03-27T18:00:00.000Z'),
        updatedAt: new Date('2026-03-27T18:00:00.000Z'),
      },
    ]);
    prismaService.link.count.mockResolvedValue(7);
    prismaService.link.aggregate.mockResolvedValue({
      _sum: {
        clicks: 42,
      },
    });

    await expect(
      linksService.findCurrentUserLinks('user-1', { page: 2, limit: 2 }),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'link-1',
          shortCode: 'alpha123',
        }),
        expect.objectContaining({
          id: 'link-2',
          shortCode: 'beta1234',
        }),
      ],
      page: 2,
      limit: 2,
      total: 7,
      totalPages: 4,
      totalClicks: 42,
    });

    expect(prismaService.link.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        skip: 2,
        take: 2,
      }),
    );
  });

  it('resolves short code from cache', async () => {
    redisService.get.mockResolvedValueOnce('https://cached.example.com');

    await expect(linksService.resolveShortCode('abc12345')).resolves.toBe(
      'https://cached.example.com',
    );

    expect(redisService.get).toHaveBeenCalledWith('abc12345');
    expect(prismaService.link.findUnique).not.toHaveBeenCalled();
  });

  it('resolves short code from database and caches it', async () => {
    redisService.get.mockResolvedValueOnce(null);
    prismaService.link.findUnique.mockResolvedValueOnce({
      originalUrl: 'https://db.example.com',
      isActive: true,
      expiresAt: null,
    });

    await expect(linksService.resolveShortCode('xyz98765')).resolves.toBe(
      'https://db.example.com',
    );

    expect(prismaService.link.findUnique).toHaveBeenCalledWith({
      where: { code: 'xyz98765' },
      select: {
        originalUrl: true,
        isActive: true,
        expiresAt: true,
      },
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'xyz98765',
      'https://db.example.com',
      86400,
    );
  });

  it('throws not found when short code does not exist', async () => {
    redisService.get.mockResolvedValueOnce(null);
    prismaService.link.findUnique.mockResolvedValueOnce(null);

    await expect(
      linksService.resolveShortCode('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('throws not found when link is inactive', async () => {
    redisService.get.mockResolvedValueOnce(null);
    prismaService.link.findUnique.mockResolvedValueOnce({
      originalUrl: 'https://db.example.com',
      isActive: false,
      expiresAt: null,
    });

    await expect(
      linksService.resolveShortCode('inactive'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('throws not found when link is expired', async () => {
    redisService.get.mockResolvedValueOnce(null);
    prismaService.link.findUnique.mockResolvedValueOnce({
      originalUrl: 'https://db.example.com',
      isActive: true,
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      linksService.resolveShortCode('expired'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('updates an owned link', async () => {
    prismaService.$queryRaw
      .mockResolvedValueOnce([{ id: 'link-1', userId: 'user-1' }])
      .mockResolvedValueOnce([
        {
          id: 'link-1',
          code: 'alpha123',
          originalUrl: 'https://example.com/a',
          title: 'Updated title',
          expiresAt: new Date('2026-04-01T00:00:00.000Z'),
          clicks: 4,
          isActive: false,
          createdAt: new Date('2026-03-27T19:00:00.000Z'),
          updatedAt: new Date('2026-03-27T19:30:00.000Z'),
          userId: 'user-1',
        },
      ]);

    await expect(
      linksService.update('link-1', 'user-1', {
        title: 'Updated title',
        isActive: false,
        expiresAt: '2026-04-01T00:00:00.000Z',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'link-1',
        title: 'Updated title',
        isActive: false,
      }),
    );

    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(2);
    expect(redisService.del).toHaveBeenCalledWith('alpha123');
  });

  it('rejects updates for non-owned links', async () => {
    prismaService.$queryRaw.mockResolvedValueOnce([
      { id: 'link-1', userId: 'user-2' },
    ]);

    await expect(
      linksService.update('link-1', 'user-1', {
        title: 'Updated title',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects updates for missing links', async () => {
    prismaService.$queryRaw.mockResolvedValueOnce([]);

    await expect(
      linksService.update('missing', 'user-1', {
        title: 'Updated title',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('soft deletes an owned link', async () => {
    prismaService.$queryRaw.mockResolvedValueOnce([
      { id: 'link-1', userId: 'user-1' },
    ]);
    prismaService.$queryRaw.mockResolvedValueOnce([{ code: 'alpha123' }]);

    await expect(
      linksService.delete('link-1', 'user-1'),
    ).resolves.toBeUndefined();

    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(2);
    expect(redisService.del).toHaveBeenCalledWith('alpha123');
  });
});
