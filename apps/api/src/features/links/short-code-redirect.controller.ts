import { Controller, Get, Inject, Param, Redirect } from '@nestjs/common';
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
    const url = await this.linksService.resolveShortCode(shortCode);

    return { url };
  }
}
