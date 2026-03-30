import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Redirect,
} from '@nestjs/common';
import { LinksService } from './links.service';

@Controller()
export class ShortCodeRedirectController {
  constructor(
    @Inject(LinksService) private readonly linksService: LinksService,
  ) {}

  @Get(':shortCode')
  @Redirect(undefined, 302)
  async redirectByShortCode(
    @Param('shortCode') shortCode: string,
  ): Promise<{ url: string }> {
    if (shortCode === 'api') {
      // Keep API namespace reserved and avoid accidental redirect lookups.
      throw new NotFoundException('Link not found');
    }

    const url = await this.linksService.resolveShortCode(shortCode);

    return { url };
  }
}
