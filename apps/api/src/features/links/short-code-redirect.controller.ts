import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Redirect,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ClicksService } from '../click-events/clicks.service';
import { LinksService } from './links.service';

@Controller()
@SkipThrottle()
export class ShortCodeRedirectController {
  constructor(
    @Inject(LinksService) private readonly linksService: LinksService,
    @Inject(ClicksService) private readonly clicksService: ClicksService,
  ) {}

  @Get(':shortCode')
  @Redirect(undefined, 302)
  async redirectByShortCode(
    @Param('shortCode') shortCode: string,
    @Req() request: Request,
  ): Promise<{ url: string }> {
    if (shortCode === 'api') {
      // Keep API namespace reserved and avoid accidental redirect lookups.
      throw new NotFoundException('Link not found');
    }

    const link = await this.linksService.resolveShortCode(shortCode);

    // Analytics are best-effort and must not delay the redirect.
    void this.linksService.incrementClicks(link.id).catch(() => undefined);
    this.clicksService.record(link.id, request);

    return { url: link.url };
  }
}
