import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../config/db/prisma.service';
import { RedisService } from '../../config/redis/redis.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksQueryDto } from './dto/list-links-query.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

const SHORT_CODE_LENGTH = 8;
const MAX_GENERATION_ATTEMPTS = 10;
const SHORT_CODE_CACHE_TTL_SECONDS = 86400;

type LinkRow = {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  expiresAt: Date | null;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
};

export type CreatedLinkResponse = {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  expiresAt: Date | null;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type LinkListItem = {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type LinkSummaryResponse = {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LinksPageResponse = {
  items: LinkSummaryResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalClicks: number;
};

type LinkOwnershipRow = {
  id: string;
  userId: string | null;
};

@Injectable()
export class LinksService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  async resolveShortCode(shortCode: string): Promise<string> {
    const cachedUrl = await this.redisService.get(shortCode);

    if (cachedUrl) {
      return cachedUrl;
    }

    const link = await this.prismaService.link.findUnique({
      where: { code: shortCode },
      select: {
        originalUrl: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!link || !link.isActive || this.isExpired(link.expiresAt)) {
      throw new NotFoundException('Link not found');
    }

    await this.redisService.set(
      shortCode,
      link.originalUrl,
      SHORT_CODE_CACHE_TTL_SECONDS,
    );

    return link.originalUrl;
  }

  async create(createLinkDto: CreateLinkDto): Promise<CreatedLinkResponse> {
    const expiresAt = createLinkDto.expiresAt
      ? new Date(createLinkDto.expiresAt)
      : null;

    if (createLinkDto.customSlug) {
      await this.ensureShortCodeIsAvailable(createLinkDto.customSlug);

      return this.insertLink({
        shortCode: createLinkDto.customSlug,
        originalUrl: createLinkDto.originalUrl,
        title: createLinkDto.title ?? null,
        expiresAt,
      });
    }

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const shortCode = nanoid(SHORT_CODE_LENGTH);

      if (await this.shortCodeExists(shortCode)) {
        continue;
      }

      try {
        return await this.insertLink({
          shortCode,
          originalUrl: createLinkDto.originalUrl,
          title: createLinkDto.title ?? null,
          expiresAt,
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new InternalServerErrorException(
      'Failed to generate a unique short code',
    );
  }

  async findCurrentUserLinks(
    userId: string,
    query: ListLinksQueryDto,
  ): Promise<LinksPageResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where = {
      userId,
    };

    const [links, total, totals] = await this.prismaService.$transaction([
      this.prismaService.link.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          code: true,
          originalUrl: true,
          title: true,
          clicks: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.link.count({ where }),
      this.prismaService.link.aggregate({
        where,
        _sum: {
          clicks: true,
        },
      }),
    ]);

    return {
      items: links.map((link) => this.mapToSummary(link)),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      totalClicks: totals._sum.clicks ?? 0,
    };
  }

  async update(
    linkId: string,
    currentUserId: string,
    updateLinkDto: UpdateLinkDto,
  ): Promise<CreatedLinkResponse> {
    await this.ensureOwnership(linkId, currentUserId);

    const updatedLinks = await this.prismaService.$queryRaw<LinkRow[]>`
      UPDATE "links"
      SET
        "title" = CASE WHEN ${updateLinkDto.title !== undefined} THEN ${updateLinkDto.title ?? null} ELSE "title" END,
        "isActive" = CASE WHEN ${updateLinkDto.isActive !== undefined} THEN ${updateLinkDto.isActive ?? false} ELSE "isActive" END,
        "expiresAt" = CASE WHEN ${updateLinkDto.expiresAt !== undefined} THEN ${updateLinkDto.expiresAt ? new Date(updateLinkDto.expiresAt) : null} ELSE "expiresAt" END,
        "updatedAt" = NOW()
      WHERE "id" = ${linkId}
      RETURNING
        "id",
        "code",
        "originalUrl",
        "title",
        "expiresAt",
        "clicks",
        "isActive",
        "createdAt",
        "updatedAt",
        "userId"
    `;

    const updatedLink = updatedLinks[0];

    if (!updatedLink) {
      throw new InternalServerErrorException('Failed to update link');
    }

    await this.redisService.del(updatedLink.code);

    return this.mapToResponse(updatedLink);
  }

  async delete(linkId: string, currentUserId: string): Promise<void> {
    await this.ensureOwnership(linkId, currentUserId);

    const deletedLinks = await this.prismaService.$queryRaw<
      Array<{ code: string }>
    >`
      UPDATE "links"
      SET
        "isActive" = FALSE,
        "updatedAt" = NOW()
      WHERE "id" = ${linkId}
      RETURNING "code"
    `;

    const deletedLink = deletedLinks[0];

    if (!deletedLink) {
      throw new InternalServerErrorException('Failed to delete link');
    }

    await this.redisService.del(deletedLink.code);
  }

  private async ensureShortCodeIsAvailable(shortCode: string): Promise<void> {
    if (await this.shortCodeExists(shortCode)) {
      throw new ConflictException('Short code is already in use');
    }
  }

  private async shortCodeExists(shortCode: string): Promise<boolean> {
    const existingLinks = await this.prismaService.$queryRaw<
      Array<{ code: string }>
    >`
      SELECT "code"
      FROM "links"
      WHERE "code" = ${shortCode}
      LIMIT 1
    `;

    return existingLinks.length > 0;
  }

  private async ensureOwnership(
    linkId: string,
    currentUserId: string,
  ): Promise<void> {
    const link = await this.findLinkOwnership(linkId);

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.userId !== currentUserId) {
      throw new ForbiddenException('You do not have access to this link');
    }
  }

  private async findLinkOwnership(
    linkId: string,
  ): Promise<LinkOwnershipRow | null> {
    const links = await this.prismaService.$queryRaw<LinkOwnershipRow[]>`
      SELECT "id", "userId"
      FROM "links"
      WHERE "id" = ${linkId}
      LIMIT 1
    `;

    return links[0] ?? null;
  }

  private async insertLink(params: {
    shortCode: string;
    originalUrl: string;
    title: string | null;
    expiresAt: Date | null;
  }): Promise<CreatedLinkResponse> {
    const insertedLinks = await this.prismaService.$queryRaw<LinkRow[]>`
      INSERT INTO "links" (
        "id",
        "code",
        "originalUrl",
        "title",
        "expiresAt",
        "createdAt",
        "updatedAt",
        "userId"
      ) VALUES (
        ${randomUUID()},
        ${params.shortCode},
        ${params.originalUrl},
        ${params.title},
        ${params.expiresAt},
        NOW(),
        NOW(),
        NULL
      )
      RETURNING
        "id",
        "code",
        "originalUrl",
        "title",
        "expiresAt",
        "clicks",
        "isActive",
        "createdAt",
        "updatedAt",
        "userId"
    `;

    const insertedLink = insertedLinks[0];

    if (!insertedLink) {
      throw new InternalServerErrorException('Failed to create link');
    }

    return this.mapToResponse(insertedLink);
  }

  private mapToResponse(link: LinkRow): CreatedLinkResponse {
    return {
      id: link.id,
      shortCode: link.code,
      originalUrl: link.originalUrl,
      title: link.title,
      expiresAt: link.expiresAt,
      clicks: link.clicks,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  private mapToSummary(link: LinkListItem): LinkSummaryResponse {
    return {
      id: link.id,
      shortCode: link.code,
      originalUrl: link.originalUrl,
      title: link.title,
      clicks: link.clicks,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
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

  private isExpired(expiresAt: Date | null): boolean {
    return expiresAt !== null && expiresAt <= new Date();
  }
}
