import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../config/db/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksQueryDto } from './dto/list-links-query.dto';

const SHORT_CODE_LENGTH = 8;
const MAX_GENERATION_ATTEMPTS = 10;

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

@Injectable()
export class LinksService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

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
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
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
}
