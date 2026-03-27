import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../../config/db/prisma.service';
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
  };
  let linksService: LinksService;

  beforeEach(() => {
    prismaService = {
      $queryRaw: jest.fn(),
    };

    linksService = new LinksService(prismaService as unknown as PrismaService);

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
});
